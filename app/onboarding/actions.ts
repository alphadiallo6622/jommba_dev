"use server";
// app/onboarding/actions.ts
// Applique la politique de modération choisie dans la console admin :
// si « Validation auto. des profils » est activée, le profil fraîchement
// soumis passe directement en `validated` (sinon il reste `pending`).

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function applyModerationPolicy(): Promise<{ status: "validated" | "pending" }> {
  // Identifie le membre via sa session (cookie) — jamais via un paramètre client.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: "pending" };

  const admin = createAdminClient();
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
