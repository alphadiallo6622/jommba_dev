"use server";
// app/adminjommba/actions.ts
// Server Actions de la console admin. Chaque action vérifie le cookie admin
// (HMAC) avant d'utiliser le client service_role.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { verifyAdminToken, COOKIE, type AdminSession, type AdminRole } from "@/lib/admin/auth";
import { hasPermission, ADMIN_ROLES, type AdminPermission } from "@/lib/admin/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { deleteCloudinaryImage, publicIdFromUrl } from "@/lib/cloudinary";
import { PHOTO_REJECTED_MESSAGE } from "@/lib/photo-messages";
import type { BroadcastTarget, Json } from "@/lib/supabase/types";
import type { LimitsSettings, PricingSettings, BoostPricingSettings, MaintenanceSettings, GeoBlockSettings } from "@/lib/admin/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireAdmin(permission?: AdminPermission): Promise<AdminSession> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;
  if (!session) throw new Error("Non autorisé");

  // Les comptes créés en BDD sont revérifiés à chaque mutation :
  // un compte désactivé entre-temps perd immédiatement l'accès en écriture.
  if (session.accountId) {
    const { data: account } = await createAdminClient()
      .from("admin_accounts")
      .select("status,role")
      .eq("id", session.accountId)
      .maybeSingle();
    if (!account || account.status !== "active") {
      throw new Error("Compte désactivé — contactez le super-admin");
    }
    session.role = account.role as AdminRole; // rôle à jour, pas celui du token
  }

  if (permission && !hasPermission(session.role, permission)) {
    throw new Error(`Accès refusé — votre rôle (${session.role}) ne permet pas cette action`);
  }
  return session;
}

function refresh() {
  revalidatePath("/adminjommba", "layout");
}

async function run(
  fn: (session: AdminSession) => Promise<void>,
  permission?: AdminPermission,
): Promise<ActionResult> {
  try {
    const session = await requireAdmin(permission);
    await fn(session);
    refresh();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur inconnue" };
  }
}

async function notifyUser(userId: string, type: string, title: string, body: string) {
  const supabase = createAdminClient();
  await supabase.from("notifications").insert({ user_id: userId, type, title, body, is_read: false });
}

async function getMemberContact(userId: string): Promise<{ email: string; name: string }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("admin_members")
    .select("email,first_name,last_name")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Membre introuvable");
  return { email: data.email, name: [data.first_name, data.last_name].filter(Boolean).join(" ") || "Membre" };
}

/** Envoie l'email transactionnel ; n'échoue jamais silencieusement mais ne
 * doit pas empêcher l'action principale (notification déjà enregistrée). */
async function sendOrThrow(input: Parameters<typeof sendEmail>[0]) {
  try {
    await sendEmail(input);
  } catch (err) {
    console.error("[email] envoi échoué:", err);
    throw new Error(
      "Notification enregistrée dans l'app, mais l'envoi de l'email a échoué (configuration SMTP).",
    );
  }
}

// ── Contact direct d'un membre ────────────────────────────────────────────────

export async function contactMember(
  userId: string,
  subject: string,
  body: string,
): Promise<ActionResult> {
  return run(async () => {
    if (!subject.trim() || !body.trim()) throw new Error("Sujet et message requis");
    const contact = await getMemberContact(userId);

    await notifyUser(userId, "admin_message", subject.trim(), body.trim());

    await sendOrThrow({
      to: contact.email,
      toName: contact.name,
      subject: subject.trim(),
      text: body.trim(),
      signatureName: "Admin Jommba",
      signatureRole: "Équipe Jommba · contact@jommba.com",
    });
  }, "moderation");
}

// ── Validation de profils ─────────────────────────────────────────────────────

export async function validateProfile(userId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: "validated", validated_at: new Date().toISOString(), refusal_reason: null })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    await notifyUser(userId, "moderation", "Profil validé 🎉",
      "Félicitations ! Votre profil a été validé par notre équipe. Il est maintenant visible par les autres membres.");
  }, "moderation");
}

export async function refuseProfile(userId: string, reason: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles")
      .update({ status: "refused", refusal_reason: reason })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    await notifyUser(userId, "moderation", "Profil refusé",
      `Votre profil n'a pas pu être validé. Motif : ${reason}. Vous pouvez le modifier puis le soumettre à nouveau.`);
  }, "moderation");
}

// ── Photos ────────────────────────────────────────────────────────────────────

export async function approvePhoto(photoId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profile_photos").update({ status: "approved" }).eq("id", photoId);
    if (error) throw new Error(error.message);
  }, "moderation");
}

export async function rejectPhoto(photoId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { data: photo, error: readErr } = await supabase
      .from("profile_photos").select("*").eq("id", photoId).single();
    if (readErr || !photo) throw new Error(readErr?.message ?? "Photo introuvable");

    // 1. Suppression du fichier Cloudinary (non bloquant en cas d'échec).
    const publicId = photo.public_id ?? publicIdFromUrl(photo.url);
    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    // 2. Suppression de la ligne en BDD.
    const { error } = await supabase.from("profile_photos").delete().eq("id", photoId);
    if (error) throw new Error(error.message);

    // 3. Si c'était la photo principale, on retire l'avatar du profil : sans
    //    avatar, le profil n'est plus visible par les autres membres (filtre
    //    avatar_url IS NOT NULL sur les surfaces de navigation).
    if (photo.is_primary) {
      await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", photo.user_id);
    }

    // 4. Notification in-app + email pour inviter à reposer une photo conforme.
    await notifyUser(
      photo.user_id,
      "moderation",
      "Photo de profil non conforme",
      PHOTO_REJECTED_MESSAGE,
    );

    try {
      const contact = await getMemberContact(photo.user_id);
      await sendEmail({
        to: contact.email,
        toName: contact.name,
        subject: "Votre photo de profil n'est pas conforme",
        text: PHOTO_REJECTED_MESSAGE,
        signatureName: "Équipe Jommba",
        signatureRole: "Modération · contact@jommba.com",
      });
    } catch (err) {
      // L'email ne doit pas faire échouer le rejet : la notif in-app est déjà posée.
      console.error("[rejectPhoto] email non envoyé:", err);
    }
  }, "moderation");
}

// ── Signalements ──────────────────────────────────────────────────────────────

export async function dismissReport(reportId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("reports").update({ status: "resolved" }).eq("id", reportId);
    if (error) throw new Error(error.message);
  }, "moderation");
}

export async function warnReportedMember(reportId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { data: report, error: readErr } = await supabase
      .from("reports").select("*").eq("id", reportId).single();
    if (readErr || !report) throw new Error(readErr?.message ?? "Signalement introuvable");

    await notifyUser(report.reported_id, "moderation", "Avertissement",
      "Suite à un signalement, nous vous rappelons les règles de la communauté Jommba. Tout nouveau manquement pourra entraîner la suspension de votre compte.");
    const { error } = await supabase
      .from("reports").update({ status: "reviewed" }).eq("id", reportId);
    if (error) throw new Error(error.message);
  }, "moderation");
}

export async function suspendReportedMember(reportId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { data: report, error: readErr } = await supabase
      .from("reports").select("*").eq("id", reportId).single();
    if (readErr || !report) throw new Error(readErr?.message ?? "Signalement introuvable");

    const { error } = await supabase
      .from("profiles").update({ status: "suspended" }).eq("user_id", report.reported_id);
    if (error) throw new Error(error.message);

    await supabase.from("reports").update({ status: "resolved" }).eq("id", reportId);
    await notifyUser(report.reported_id, "moderation", "Compte suspendu",
      "Votre compte a été suspendu suite à un signalement. Contactez le support pour plus d'informations.");
  }, "moderation");
}

// ── Membres ───────────────────────────────────────────────────────────────────

export async function suspendMember(userId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("profiles").update({ status: "suspended" }).eq("user_id", userId);
    if (error) throw new Error(error.message);
    await notifyUser(userId, "moderation", "Compte suspendu",
      "Votre compte a été suspendu par un administrateur. Contactez le support pour plus d'informations.");
  }, "moderation");
}

export async function offerPremium(userId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Historique multi-lignes : on clôt l'abonnement actif éventuel (conservé en
    // historique) puis on insère une NOUVELLE ligne pour le mois offert.
    await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: now, updated_at: now })
      .eq("user_id", userId)
      .eq("status", "active");

    const { error: subErr } = await supabase.from("subscriptions").insert({
      user_id: userId,
      plan: "premium",
      status: "active",
      duration_months: 1,
      payment_method: "Offert",
      price_usd: 0,
      current_period_end: periodEnd.toISOString(),
      square_subscription_id: null,
      square_customer_id: null,
      square_card_id: null,
      updated_at: now,
    });
    if (subErr) throw new Error(subErr.message);

    const { error } = await supabase
      .from("profiles").update({ is_premium: true }).eq("user_id", userId);
    if (error) throw new Error(error.message);

    await notifyUser(userId, "premium", "Premium offert 🎁",
      "L'équipe Jommba vous offre 1 mois d'accès Premium. Profitez-en !");
  }, "monetization");
}

export async function deleteMember(userId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  }, "members-delete");
}

// ── Abonnements ───────────────────────────────────────────────────────────────

export async function cancelSubscription(subscriptionId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", subscriptionId)
      .select().single();
    if (error || !sub) throw new Error(error?.message ?? "Abonnement introuvable");

    await supabase.from("profiles").update({ is_premium: false }).eq("user_id", sub.user_id);
    await notifyUser(sub.user_id, "premium", "Abonnement résilié",
      "Votre abonnement Premium a été résilié. Vous pouvez vous réabonner à tout moment.");
  }, "monetization");
}

export async function refundSubscription(subscriptionId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();

    // 1) Charge l'abonnement AVANT toute écriture : on a besoin du montant payé et
    //    du customer Square pour déclencher le remboursement réel.
    const { data: sub, error: readErr } = await supabase
      .from("subscriptions").select("*").eq("id", subscriptionId).single();
    if (readErr || !sub) throw new Error(readErr?.message ?? "Abonnement introuvable");
    if (sub.refunded_at) throw new Error("Cet abonnement a déjà été remboursé");

    const paidUsd = Number(sub.price_usd ?? 0);
    if (paidUsd <= 0) {
      throw new Error("Aucun montant payé : cet abonnement ne peut pas être remboursé (ex. Premium offert).");
    }

    // Seuls les paiements Square se remboursent depuis ce bouton ; les autres
    // moyens de paiement (carte hors Square, etc.) se remboursent manuellement.
    if (sub.payment_method !== "square" || !sub.square_customer_id) {
      throw new Error(
        "Seuls les paiements Square sont remboursables ici. Ce paiement doit être remboursé manuellement.",
      );
    }

    // 2) Remboursement réel de 70 % via Square (30 % = frais de service).
    //    Si le paiement Square est introuvable, on stoppe : rien n'est marqué en base.
    const { refundSquareSubscription } = await import("@/lib/square/refund");
    const { refundedUsd } = await refundSquareSubscription({
      squareCustomerId: sub.square_customer_id,
      paidUsd,
    });

    // 3) Annule l'abonnement récurrent côté Square : sans cela, le renouvellement
    //    automatique repaie et le webhook (invoice.payment_made) réactiverait le
    //    Premium. Non bloquant : un échec Square ne doit pas empêcher la coupure locale.
    if (sub.square_subscription_id) {
      try {
        const { square } = await import("@/lib/square/client");
        await square.subscriptions.cancel({ subscriptionId: sub.square_subscription_id });
      } catch (err) {
        console.error("[refundSubscription] annulation Square échouée:", err);
      }
    }

    // 4) Marque l'abonnement remboursé + résilié, coupe la période en cours et
    //    retire le Premium immédiatement.
    const now = new Date().toISOString();
    const { error: updErr } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: now,
        refunded_at: now,
        current_period_end: now,
        updated_at: now,
      })
      .eq("id", subscriptionId);
    if (updErr) throw new Error(updErr.message);
    await supabase.from("profiles").update({ is_premium: false }).eq("user_id", sub.user_id);

    // 5) Notification in-app + email au membre.
    const amountLabel = `${refundedUsd.toLocaleString("fr-FR")} $`;
    await notifyUser(sub.user_id, "premium", "Remboursement confirmé",
      `Votre abonnement Premium a été remboursé à hauteur de ${amountLabel} (70 % du montant payé ; les 30 % restants correspondent aux frais de service). Le montant sera crédité sous 5 à 10 jours ouvrés.`);

    const contact = await getMemberContact(sub.user_id).catch(() => null);
    if (contact) {
      await sendEmail({
        to: contact.email,
        toName: contact.name,
        subject: "Votre remboursement Premium est confirmé",
        text:
          `Nous vous confirmons le remboursement de votre abonnement Premium.\n\n` +
          `Montant remboursé : ${amountLabel} (70 % du montant payé).\n` +
          `Les 30 % restants correspondent aux frais de service, non remboursables.\n\n` +
          `Le crédit apparaîtra sur votre moyen de paiement sous 5 à 10 jours ouvrés.`,
        signatureName: "Équipe Jommba",
        signatureRole: "Facturation · contact@jommba.com",
      }).catch((err) => console.error("[refundSubscription] email membre non envoyé:", err));
    }

    // 6) Email de confirmation à l'administration.
    await sendEmail({
      to: "contact@jommba.com",
      subject: `Remboursement effectué · ${contact?.name ?? sub.user_id}`,
      text:
        `Un remboursement Premium vient d'être effectué depuis la console admin.\n\n` +
        `Membre : ${contact?.name ?? "—"} (${contact?.email ?? "—"})\n` +
        `Montant payé : ${paidUsd.toLocaleString("fr-FR")} $\n` +
        `Montant remboursé : ${amountLabel} (70 %)\n` +
        `Frais de service conservés : ${(Math.round((paidUsd - refundedUsd) * 100) / 100).toLocaleString("fr-FR")} $ (30 %)`,
      signatureName: "Console Jommba",
      signatureRole: "Notification automatique",
    }).catch((err) => console.error("[refundSubscription] email admin non envoyé:", err));
  }, "monetization");
}

// ── Boosts ────────────────────────────────────────────────────────────────────

export async function stopBoost(boostId: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("boosts").update({ expires_at: new Date().toISOString() }).eq("id", boostId);
    if (error) throw new Error(error.message);
  }, "monetization");
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogPostInput {
  id?: string;
  title: string;
  category: string;
  author: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  featured: boolean;
  status: "draft" | "published";
}

export async function saveBlogPost(input: BlogPostInput): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    if (!input.title.trim()) throw new Error("Le titre est requis");

    const fields = {
      title: input.title.trim(),
      category: input.category,
      author: input.author,
      excerpt: input.excerpt,
      content: input.content,
      cover_image_url: input.coverImage,
      featured: input.featured,
      status: input.status,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { data: existing } = await supabase
        .from("blog_posts").select("published_at").eq("id", input.id).single();
      const published_at =
        input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at ?? null;
      const { error } = await supabase
        .from("blog_posts").update({ ...fields, published_at }).eq("id", input.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("blog_posts").insert({
        ...fields,
        published_at: input.status === "published" ? new Date().toISOString() : null,
      });
      if (error) throw new Error(error.message);
    }
  }, "content");
}

export async function setBlogPostStatus(id: string, status: "draft" | "published"): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "published") {
      const { data: existing } = await supabase
        .from("blog_posts").select("published_at").eq("id", id).single();
      if (!existing?.published_at) patch.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }, "content");
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, "content");
}

// ── Académie du Mariage ───────────────────────────────────────────────────────
// Même modèle éditorial que le blog, sur la table academy_articles.

export async function saveAcademyArticle(input: BlogPostInput): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    if (!input.title.trim()) throw new Error("Le titre est requis");

    const fields = {
      title: input.title.trim(),
      category: input.category,
      author: input.author,
      excerpt: input.excerpt,
      content: input.content,
      cover_image_url: input.coverImage,
      featured: input.featured,
      status: input.status,
      updated_at: new Date().toISOString(),
    };

    if (input.id) {
      const { data: existing } = await supabase
        .from("academy_articles").select("published_at").eq("id", input.id).single();
      const published_at =
        input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : existing?.published_at ?? null;
      const { error } = await supabase
        .from("academy_articles").update({ ...fields, published_at }).eq("id", input.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("academy_articles").insert({
        ...fields,
        published_at: input.status === "published" ? new Date().toISOString() : null,
      });
      if (error) throw new Error(error.message);
    }
  }, "content");
}

export async function setAcademyArticleStatus(id: string, status: "draft" | "published"): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "published") {
      const { data: existing } = await supabase
        .from("academy_articles").select("published_at").eq("id", id).single();
      if (!existing?.published_at) patch.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("academy_articles").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }, "content");
}

export async function deleteAcademyArticle(id: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("academy_articles").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, "content");
}

// ── Diffusions (annonces) ─────────────────────────────────────────────────────

export async function sendBroadcast(
  title: string,
  message: string,
  target: BroadcastTarget,
): Promise<ActionResult> {
  return run(async () => {
    if (!title.trim() || !message.trim()) throw new Error("Titre et message requis");
    const supabase = createAdminClient();

    let query = supabase.from("profiles").select("user_id");
    if (target === "free")    query = query.eq("is_premium", false);
    if (target === "premium") query = query.eq("is_premium", true);
    if (target === "pending") query = query.eq("status", "pending");
    const { data: targets, error: targetErr } = await query.limit(50_000);
    if (targetErr) throw new Error(targetErr.message);

    const userIds = (targets ?? []).map((t) => t.user_id);
    if (userIds.length > 0) {
      const rows = userIds.map((user_id) => ({
        user_id,
        type: "announcement",
        title: title.trim(),
        body: message.trim(),
        is_read: false,
      }));
      // Insertion par lots pour rester sous les limites de payload.
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from("notifications").insert(rows.slice(i, i + 500));
        if (error) throw new Error(error.message);
      }
    }

    const { error } = await supabase.from("broadcasts").insert({
      title: title.trim(),
      message: message.trim(),
      target,
      recipient_count: userIds.length,
    });
    if (error) throw new Error(error.message);
  }, "content");
}

// ── Support ───────────────────────────────────────────────────────────────────

export async function replyToTicket(ticketId: string, reply: string): Promise<ActionResult> {
  return run(async () => {
    if (!reply.trim()) throw new Error("Le message ne peut pas être vide");
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .update({ admin_reply: reply.trim(), replied_at: now, status: "closed", updated_at: now })
      .eq("id", ticketId)
      .select().single();
    if (error || !ticket) throw new Error(error?.message ?? "Ticket introuvable");

    const contact = await getMemberContact(ticket.user_id);
    const subject = `Re : ${ticket.subject}`;

    await notifyUser(ticket.user_id, "support", subject, reply.trim());

    await sendOrThrow({
      to: contact.email,
      toName: contact.name,
      subject,
      text: reply.trim(),
      signatureName: "Admin Jommba",
      signatureRole: "Équipe Support · contact@jommba.com",
    });
  }, "support");
}

// ── Paramètres : équipe admin ─────────────────────────────────────────────────
// Le super-admin crée directement les comptes (email + mot de passe + rôle).
// Chaque compte a son propre utilisateur Supabase Auth, marqué is_admin pour
// ne pas apparaître comme membre de l'application.

/** La ligne seed du super-admin (clé maître env) : jamais modifiable ici. */
async function assertNotMasterRow(id: string): Promise<{ user_id: string | null; role: string; email: string; name: string }> {
  const { data: account } = await createAdminClient()
    .from("admin_accounts")
    .select("user_id,role,email,name")
    .eq("id", id)
    .maybeSingle();
  if (!account) throw new Error("Compte introuvable");
  if (account.role === "super-admin" && !account.user_id) {
    throw new Error("Le compte super-admin principal est géré via les variables d'environnement");
  }
  return account;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export async function createAdminAccount(input: CreateAdminInput): Promise<ActionResult> {
  return run(async () => {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    if (!name) throw new Error("Le nom est requis");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Adresse email invalide");
    if (input.password.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    if (!ADMIN_ROLES.includes(input.role as AdminRole)) throw new Error("Rôle invalide");

    const supabase = createAdminClient();

    // Un email déjà pris par un membre ne peut pas devenir un compte admin :
    // l'identité admin doit être dédiée.
    const { data: created, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { is_admin: true, name },
    });
    if (authError || !created.user) {
      const msg = authError?.message ?? "";
      throw new Error(
        /already|exists|registered/i.test(msg)
          ? "Cet email est déjà utilisé (compte membre ou admin existant)"
          : msg || "Création du compte impossible",
      );
    }

    const { error } = await supabase.from("admin_accounts").insert({
      name,
      email,
      role: input.role,
      status: "active",
      user_id: created.user.id,
    });
    if (error) {
      // Rollback : pas de ligne admin ⇒ pas d'utilisateur auth orphelin.
      await supabase.auth.admin.deleteUser(created.user.id);
      throw new Error(error.code === "23505" ? "Cet email est déjà administrateur" : error.message);
    }
  }, "accounts");
}

export async function updateAdminRole(id: string, role: string): Promise<ActionResult> {
  return run(async (session) => {
    if (!ADMIN_ROLES.includes(role as AdminRole)) throw new Error("Rôle invalide");
    await assertNotMasterRow(id);
    if (session.accountId === id && role !== "super-admin") {
      throw new Error("Vous ne pouvez pas rétrograder votre propre rôle");
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("admin_accounts").update({ role }).eq("id", id);
    if (error) throw new Error(error.message);
  }, "accounts");
}

export async function setAdminAccountStatus(
  id: string,
  status: "active" | "disabled",
): Promise<ActionResult> {
  return run(async (session) => {
    await assertNotMasterRow(id);
    if (session.accountId === id) throw new Error("Vous ne pouvez pas désactiver votre propre compte");
    const supabase = createAdminClient();
    const { error } = await supabase.from("admin_accounts").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
  }, "accounts");
}

export async function deleteAdminAccount(id: string): Promise<ActionResult> {
  return run(async (session) => {
    const account = await assertNotMasterRow(id);
    if (session.accountId === id) throw new Error("Vous ne pouvez pas supprimer votre propre compte");
    const supabase = createAdminClient();

    // Supprime l'identité auth dédiée (le trigger ne l'a liée à aucun profil membre).
    if (account.user_id) {
      const { error: authError } = await supabase.auth.admin.deleteUser(account.user_id);
      if (authError) throw new Error(authError.message);
    }
    const { error } = await supabase.from("admin_accounts").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, "accounts");
}

/** Chaque admin connecté (hors clé maître) peut changer son propre mot de passe. */
export async function changeMyPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  return run(async (session) => {
    if (!session.userId) {
      throw new Error("Le mot de passe du compte principal se gère dans les variables d'environnement");
    }
    if (newPassword.length < 8) throw new Error("Le nouveau mot de passe doit contenir au moins 8 caractères");

    // Vérifie le mot de passe actuel avant d'autoriser le changement.
    const bare = createBareClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error: signInError } = await bare.auth.signInWithPassword({
      email: session.email,
      password: currentPassword,
    });
    if (signInError) throw new Error("Mot de passe actuel incorrect");

    const supabase = createAdminClient();
    const { error } = await supabase.auth.admin.updateUserById(session.userId, {
      password: newPassword,
    });
    if (error) throw new Error(error.message);
  });
}

// ── Paramètres : connexions API ───────────────────────────────────────────────
// Les clés sont lues depuis les variables d'environnement (voir
// getApiConnections dans lib/admin/queries.ts) : l'écran est en lecture seule,
// il n'y a donc pas d'action d'écriture ici.

// ── Paramètres : limites & tarification ───────────────────────────────────────

export async function saveLimits(limits: LimitsSettings): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      id: 1,
      limits: limits as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }, "settings");
}

/** Active ou désactive le mode maintenance du site public. */
export async function setMaintenance(maintenance: MaintenanceSettings): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      id: 1,
      maintenance: {
        enabled: maintenance.enabled,
        message: maintenance.message?.trim() || null,
      } as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    // Le middleware lit le drapeau à chaque requête : on invalide tout le cache
    // pour que la bascule prenne effet immédiatement.
    revalidatePath("/", "layout");
  }, "settings");
}

/** Configure le blocage par pays (liste noire ou liste blanche). */
export async function setGeoBlock(geoBlock: GeoBlockSettings): Promise<ActionResult> {
  return run(async () => {
    const mode = geoBlock.mode === "allow" ? "allow" : "block";
    // Normalise les codes pays : ISO 3166-1 alpha-2, en majuscules, dédupliqués.
    const countries = Array.from(
      new Set(
        (geoBlock.countries ?? [])
          .map((c) => c.trim().toUpperCase())
          .filter((c) => /^[A-Z]{2}$/.test(c)),
      ),
    );

    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      id: 1,
      geo_block: {
        enabled: geoBlock.enabled === true,
        mode,
        countries,
      } as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    // Le middleware lit le drapeau à chaque requête : on invalide tout le cache
    // pour que la bascule prenne effet immédiatement.
    revalidatePath("/", "layout");
  }, "settings");
}

export async function savePricing(pricing: PricingSettings): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      id: 1,
      pricing: pricing as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }, "settings");
}

/** Prix des boosts (USD), réglables indépendamment les uns des autres. */
export async function saveBoostPricing(boostPricing: BoostPricingSettings): Promise<ActionResult> {
  return run(async () => {
    for (const [id, price] of Object.entries(boostPricing)) {
      if (!(price > 0)) throw new Error(`Le prix du boost ${id} doit être supérieur à 0`);
    }
    const supabase = createAdminClient();
    const { error } = await supabase.from("platform_settings").upsert({
      id: 1,
      boost_pricing: boostPricing as unknown as Json,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
  }, "settings");
}

// ── Codes promo ───────────────────────────────────────────────────────────────

export async function createPromoCode(input: {
  code: string;
  discountType: "percent" | "fixed_amount";
  value: number;
  applicablePlans: string[] | null;
  expiresAt: string | null;
  usageLimit: number | null;
}): Promise<ActionResult> {
  return run(async () => {
    const code = input.code.trim().toUpperCase();
    if (!code) throw new Error("Le code ne peut pas être vide");
    if (!(input.value > 0)) throw new Error("La valeur doit être positive");

    const supabase = createAdminClient();
    const { error } = await supabase.from("promo_codes").insert({
      code,
      discount_type: input.discountType,
      value: input.value,
      applicable_plans: input.applicablePlans && input.applicablePlans.length > 0 ? input.applicablePlans : null,
      expires_at: input.expiresAt,
      usage_limit: input.usageLimit,
    });
    if (error) {
      if (error.code === "23505") throw new Error("Ce code existe déjà");
      throw new Error(error.message);
    }
  }, "settings");
}

export async function togglePromoCodeActive(id: string, active: boolean): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("promo_codes")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }, "settings");
}

export async function deletePromoCode(id: string): Promise<ActionResult> {
  return run(async () => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }, "settings");
}
