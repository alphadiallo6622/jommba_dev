// app/api/cron/photo-reminders/route.ts
// Rappel périodique : envoie un email aux membres SANS photo de profil dont le
// dernier rappel date de plus de 3 jours (ou jamais). Déclenché par Vercel Cron
// (voir vercel.json) et protégé par CRON_SECRET.
//
// Dès qu'un membre ajoute une photo (avatar_url non null), il sort de la
// sélection : il ne reçoit plus de rappel.
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email"
import { PHOTO_REMINDER_MESSAGE, PHOTO_REMINDER_SUBJECT } from "@/lib/photo-messages"

// Toujours exécuté à la demande, jamais mis en cache.
export const dynamic = "force-dynamic"

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  // Authentification du cron : header Authorization: Bearer <CRON_SECRET>.
  // Vercel Cron ajoute automatiquement ce header quand CRON_SECRET est défini.
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - THREE_DAYS_MS).toISOString()

  // Profils sans photo dont le dernier rappel est null OU antérieur au seuil.
  // Deux requêtes (null / ancien) fusionnées côté serveur : PostgREST ne gère
  // pas proprement `is null OR lt` dans un seul filtre chaîné.
  const [neverReminded, staleReminded] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .is("avatar_url", null)
      .is("last_photo_reminder_at", null),
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .is("avatar_url", null)
      .lt("last_photo_reminder_at", cutoff),
  ])

  if (neverReminded.error || staleReminded.error) {
    console.error("[cron/photo-reminders] lecture:", neverReminded.error ?? staleReminded.error)
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 })
  }

  const targets = [...(neverReminded.data ?? []), ...(staleReminded.data ?? [])]

  // Récupère les emails via la vue admin_members (jointure auth.users).
  let sent = 0
  let failed = 0
  const nowIso = new Date().toISOString()

  for (const p of targets) {
    try {
      const { data: member } = await supabase
        .from("admin_members")
        .select("email, first_name, last_name")
        .eq("user_id", p.user_id)
        .maybeSingle()
      if (!member?.email) continue

      const name =
        [member.first_name, member.last_name].filter(Boolean).join(" ") || "Membre"

      await sendEmail({
        to: member.email,
        toName: name,
        subject: PHOTO_REMINDER_SUBJECT,
        text: PHOTO_REMINDER_MESSAGE,
        signatureName: "Équipe Jommba",
        signatureRole: "contact@jommba.com",
      })

      // Marque le rappel comme envoyé pour respecter l'intervalle de 3 jours.
      await supabase
        .from("profiles")
        .update({ last_photo_reminder_at: nowIso })
        .eq("user_id", p.user_id)

      sent++
    } catch (err) {
      // Un échec (SMTP…) ne bloque pas les autres membres.
      console.error("[cron/photo-reminders] envoi échoué pour", p.user_id, err)
      failed++
    }
  }

  return NextResponse.json({ ok: true, candidates: targets.length, sent, failed })
}
