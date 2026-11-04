"use client";
// components/admin/ui/member-profile.tsx
//
// Fiche profil complète d'un membre, partagée par la liste Membres (bouton
// « Voir le profil complet ») et la page Signalements, où l'admin doit pouvoir
// ouvrir aussi bien le profil du signaleur que celui du membre signalé.
import { X } from "lucide-react";
import type { MemberRow } from "@/lib/admin/types";
import { Avatar } from "./avatar";
import { Badge, PremiumBadge } from "./card";
import { formatDate } from "@/lib/admin/format";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray"> = {
  validated: "green", pending: "amber", refused: "red", suspended: "gray",
};
const STATUS_LABEL: Record<string, string> = {
  validated: "Validé", pending: "En attente", refused: "Refusé", suspended: "Suspendu",
};

/** Corps de la fiche — sans en-tête ni fermeture, pour être inséré dans
 *  n'importe quelle modale. */
export function MemberProfileBody({ member }: { member: MemberRow }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {member.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatarUrl} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <Avatar name={member.name} size="md" />
        )}
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {member.name}{member.age != null && `, ${member.age} ans`}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{member.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge label={STATUS_LABEL[member.status]} tone={STATUS_TONE[member.status]} />
            {member.plan === "premium" && <PremiumBadge />}
          </div>
        </div>
      </div>

      {member.plan === "premium" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-amber-700">Abonnement Premium</p>
          <p className="text-xs font-semibold text-amber-900 mt-0.5">
            {member.subscriptionPlan ?? "Premium"}
            {" · "}
            {member.subscriptionAmount == null
              ? "Montant n/c"
              : member.subscriptionAmount === 0
                ? "Offert"
                : `${member.subscriptionAmount} $`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Email",             value: member.email },
          { label: "Localisation",      value: member.location },
          { label: "Ville",             value: member.city?.trim() || "—" },
          { label: "Pays",              value: member.country?.trim() || "—" },
          { label: "Genre",             value: member.gender === "femme" ? "Femme" : member.gender === "homme" ? "Homme" : "—" },
          { label: "Âge",               value: member.age != null ? `${member.age} ans` : "—" },
          { label: "Taille",            value: member.height != null ? `${member.height} cm` : "—" },
          { label: "Profession",        value: member.job || "—" },
          { label: "Études",            value: member.education || "—" },
          { label: "Situation",         value: member.maritalStatus || "—" },
          { label: "Madhhab",           value: member.madhhab || "—" },
          { label: "Mosquée",           value: member.mosqueFrequency || "—" },
          { label: "Niveau d'arabe",    value: member.arabicLevel || "—" },
          { label: "Langues",           value: member.languages || "—" },
          { label: "A des enfants",     value: member.hasChildren || "—" },
          { label: "Veut des enfants",  value: member.wantsChildren || "—" },
          { label: "Peut déménager",    value: member.canRelocate || "—" },
          { label: "Polygamie",         value: member.polygamy || "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3 py-2.5">
            <p className="text-[10px] font-medium text-[var(--color-muted)]">{label}</p>
            <p className="text-xs font-semibold text-[var(--color-ink)] mt-0.5 break-words">{value}</p>
          </div>
        ))}
      </div>

      {([
        ["Recherche",          member.seeking],
        ["Vision du mariage",  member.marriageVision],
        ["Centres d'intérêt",  member.interests],
        ["Bio",                member.bio],
      ] as const).map(([label, value]) => value ? (
        <div key={label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3 py-2.5">
          <p className="text-[10px] font-medium text-[var(--color-muted)]">{label}</p>
          <p className="text-xs text-[var(--color-ink)] mt-0.5 leading-relaxed">{value}</p>
        </div>
      ) : null)}

      {member.lastSignInAt && (
        <p className="text-[11px] text-[var(--color-muted)]">
          Dernière connexion : {formatDate(member.lastSignInAt)}
        </p>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-muted)]">Profil complété</span>
          <span className="font-semibold text-[var(--color-ink)]">{member.completion}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-faint)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-brand-500)]"
            style={{ width: `${member.completion}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/** Fiche profil autonome, en modale. */
export function MemberProfileModal({
  member,
  subtitle,
  onClose,
}: {
  member: MemberRow;
  /** Rôle dans le contexte d'appel (« Auteur du signalement »…). */
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-[var(--color-ink)] truncate">{member.name}</h3>
            {subtitle && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          <MemberProfileBody member={member} />
        </div>
      </div>
    </div>
  );
}
