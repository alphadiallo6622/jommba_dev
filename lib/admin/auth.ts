// lib/admin/auth.ts
// Sessions admin signées HMAC-SHA256 (Web Crypto — Edge Runtime + Node 18+).
// v2 : le token porte l'identité (email, nom, rôle) pour le multi-comptes.
// La clé maître (ADMIN_EMAIL / ADMIN_PASSWORD en env) reste le super-admin
// de secours ; les autres comptes vivent dans admin_accounts + Supabase Auth.

export const COOKIE = "admin_session";
const TTL = 8 * 60 * 60; // 8 h
const VERSION = 2;

export type AdminRole = "super-admin" | "modération" | "support" | "lecture seule";

export interface AdminSession {
  email: string;
  name: string;
  role: AdminRole;
  /** id de la ligne admin_accounts — null pour la clé maître env */
  accountId: string | null;
  /** id auth.users du compte dédié — null pour la clé maître env */
  userId: string | null;
  exp: number;
}

function b64u(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function b64uDecode(str: string): Uint8Array<ArrayBuffer> {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const binary = atob(b64 + pad);
  const buf = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_JWT_SECRET ?? "change-me-in-env";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createAdminToken(
  identity: Omit<AdminSession, "exp">,
): Promise<string> {
  const payload: AdminSession & { v: number } = {
    ...identity,
    exp: Math.floor(Date.now() / 1000) + TTL,
    v: VERSION,
  };
  const payloadB64 = b64u(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return `${payloadB64}.${b64u(sig)}`;
}

/** Retourne la session si le token est valide et non expiré, sinon null. */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64uDecode(sigB64),
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(b64uDecode(payloadB64)),
    ) as Partial<AdminSession> & { v?: number };

    // Les tokens v1 (login unique historique) ne portent pas d'identité :
    // on force une reconnexion.
    if (payload.v !== VERSION) return null;
    if (!payload.exp || Math.floor(Date.now() / 1000) >= payload.exp) return null;
    if (!payload.email || !payload.role) return null;

    return {
      email: payload.email,
      name: payload.name ?? "Admin",
      role: payload.role,
      accountId: payload.accountId ?? null,
      userId: payload.userId ?? null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
