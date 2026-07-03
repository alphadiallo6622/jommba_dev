// app/api/admin/auth/route.ts
// Connexion admin :
//  1. Clé maître — ADMIN_EMAIL / ADMIN_PASSWORD en env (inchangée, super-admin).
//  2. Comptes créés par le super-admin — admin_accounts + mot de passe Supabase Auth.
import { NextRequest, NextResponse } from "next/server";
import { createClient as createBareClient } from "@supabase/supabase-js";
import { createAdminToken, COOKIE, type AdminRole } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const INVALID = NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 8 * 60 * 60,
    path: "/",
  });
}

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  if (!email || !password) return INVALID;

  const normalized = email.trim().toLowerCase();

  // ── 1. Clé maître (env) ────────────────────────────────────────────────
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    try {
      await createAdminClient()
        .from("admin_accounts")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("role", "super-admin")
        .is("user_id", null);
    } catch {
      // Non bloquant : le login maître ne dépend pas de la BDD.
    }

    const token = await createAdminToken({
      email: normalized,
      name: "Admin Jommba",
      role: "super-admin",
      accountId: null,
      userId: null,
    });
    const res = NextResponse.json({ ok: true });
    setSessionCookie(res, token);
    return res;
  }

  // ── 2. Comptes admin_accounts (Supabase Auth) ──────────────────────────
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("admin_accounts")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (!account || !account.user_id) return INVALID;
  if (account.status !== "active") {
    return NextResponse.json(
      { error: "Compte désactivé — contactez le super-admin" },
      { status: 403 },
    );
  }

  // Vérifie le mot de passe via Supabase Auth avec un client jetable
  // (aucune session persistée, aucun cookie Supabase posé).
  const bare = createBareClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: signIn, error: signInError } = await bare.auth.signInWithPassword({
    email: normalized,
    password,
  });
  if (signInError || signIn.user?.id !== account.user_id) return INVALID;

  await admin
    .from("admin_accounts")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", account.id);

  const token = await createAdminToken({
    email: account.email,
    name: account.name,
    role: account.role as AdminRole,
    accountId: account.id,
    userId: account.user_id,
  });
  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, token);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
