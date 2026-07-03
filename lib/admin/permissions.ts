// lib/admin/permissions.ts
// Matrice rôle → permissions, appliquée côté serveur dans chaque Server Action.
// Tous les rôles connectés peuvent LIRE le dashboard ; ces permissions ne
// gouvernent que les écritures.

import type { AdminRole } from "./auth";

export type AdminPermission =
  | "moderation"      // valider/refuser profils, photos, signalements, suspendre
  | "monetization"    // abonnements (résilier, rembourser), boosts, offrir Premium
  | "content"         // blog, annonces diffusées
  | "support"         // répondre aux tickets
  | "settings"        // limites, tarification, connexions API
  | "accounts"        // gérer les comptes administrateurs
  | "members-delete"; // suppression définitive d'un compte membre

const ALL: AdminPermission[] = [
  "moderation", "monetization", "content", "support",
  "settings", "accounts", "members-delete",
];

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  "super-admin":   ALL,
  "modération":    ["moderation"],
  "support":       ["support"],
  "lecture seule": [],
};

export const ADMIN_ROLES: AdminRole[] = [
  "super-admin", "modération", "support", "lecture seule",
];

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}
