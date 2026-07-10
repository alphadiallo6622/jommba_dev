"use server";
// app/onboarding/actions.ts
// Applique la politique de modération choisie dans la console admin :
// si « Validation auto. des profils » est activée, le profil fraîchement
// soumis passe directement en `validated` (sinon il reste `pending`).

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

/** Boîte des administrateurs notifiée à chaque nouvelle inscription. */
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "jommba224@gmail.com";

/** Notifie l'équipe admin d'une nouvelle inscription. Jamais bloquant. */
async function notifyAdminsOfSignup(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<void> {
  try {
    const { data: member } = await admin
      .from("admin_members")
      .select("first_name,last_name,email,gender,age,city,country,created_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (!member) return;

    const name = [member.first_name, member.last_name].filter(Boolean).join(" ") || "Nouveau membre";
    const gender = member.gender === "femme" ? "Femme" : member.gender === "homme" ? "Homme" : "—";
    const location = [member.city, member.country].filter((v) => v && v.trim()).join(", ") || "—";

    const text = [
      `Une nouvelle inscription vient d'être finalisée sur Jommba.`,
      `Nom : ${name}\nEmail : ${member.email}\nSexe : ${gender}\nÂge : ${member.age ?? "—"}\nLocalisation : ${location}`,
      `Rendez-vous dans la console admin pour valider ce profil : /adminjommba/validation`,
    ].join("\n\n");

    await sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `Nouvelle inscription — ${name}`,
      text,
      signatureName: "Système Jommba",
      signatureRole: "Notification automatique",
    });
  } catch (err) {
    // L'échec d'email ne doit jamais empêcher la finalisation de l'inscription.
    console.error("[onboarding] notification admin échouée:", err);
  }
}

export async function applyModerationPolicy(): Promise<{ status: "validated" | "pending" }> {
  // Identifie le membre via sa session (cookie) — jamais via un paramètre client.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "pending" };

  const admin = createAdminClient();

  // Notifie l'équipe admin de la nouvelle inscription (non bloquant).
  await notifyAdminsOfSignup(admin, user.id);

  const { data: settings } = await admin
    .from("platform_settings")
    .select("pricing")
    .eq("id", 1)
    .maybeSingle();

  const autoValidate =
    (settings?.pricing as { autoValidate?: boolean } | null)?.autoValidate === true;

  if (!autoValidate) return { status: "pending" };

  await admin
    .from("profiles")
    .update({ status: "validated", validated_at: new Date().toISOString(), refusal_reason: null })
    .eq("user_id", user.id)
    .eq("status", "pending");

  return { status: "validated" };
}
