// app/api/cron/premium-expiry/route.ts
// Coupe l'accès Premium à l'échéance. Depuis le passage de Premium en paiement
// unique (plus d'abonnement Square catalogué, voir lib/pricing.ts), plus aucun
// webhook Square ne prévient d'un renouvellement ou d'une fin de période — cette
// tâche est l'unique mécanisme qui fait expirer l'accès. Déclenché par Vercel Cron
// (voir vercel.json) et protégé par CRON_SECRET.
//
// Cadence : une fois par jour (limite du plan Hobby de Vercel). Un membre peut
// donc conserver son accès jusqu'à ~24 h après l'échéance ; passer le cron en
// horaire dès le passage au plan Pro pour resserrer ce délai.
import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const supabase = createAdminClient()
  const nowIso = new Date().toISOString()

  // Lignes actives dont la période est révolue.
  const { data: expired, error: readErr } = await supabase
    .from("subscriptions")
    .select("id, user_id")
    .eq("status", "active")
    .lt("current_period_end", nowIso)

  if (readErr) {
    console.error("[cron/premium-expiry] lecture:", readErr)
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 })
  }
  if (!expired || expired.length === 0) {
    return NextResponse.json({ ok: true, expired: 0 })
  }

  const ids = expired.map((s) => s.id)
  const { error: updErr } = await supabase
    .from("subscriptions")
    .update({ status: "expired", updated_at: nowIso })
    .in("id", ids)
  if (updErr) {
    console.error("[cron/premium-expiry] mise à jour:", updErr)
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 })
  }

  // Historique multi-lignes : ne coupe le Premium que pour les membres qui n'ont
  // plus AUCUNE ligne active (un renouvellement plus récent doit rester valide).
  const userIds = Array.from(new Set(expired.map((s) => s.user_id)))
  let downgraded = 0
  for (const userId of userIds) {
    const { count } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active")
    if ((count ?? 0) === 0) {
      await supabase.from("profiles").update({ is_premium: false }).eq("user_id", userId)
      downgraded++
    }
  }

  return NextResponse.json({ ok: true, expired: expired.length, downgraded })
}
