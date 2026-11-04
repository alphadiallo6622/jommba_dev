"use client";
// app/adminjommba/(protected)/signalements/signalements-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, CheckCircle2, Quote, ExternalLink } from "lucide-react";
import type { ReportRow, MemberRow } from "@/lib/admin/types";
import {
  dismissReport, warnReportedMember, suspendReportedMember,
} from "@/app/adminjommba/actions";
import { useToast } from "@/components/admin/ui/toast";
import { MemberProfileModal } from "@/components/admin/ui/member-profile";
import { formatDate } from "@/lib/admin/format";

const SEV_LABEL: Record<string, string> = {
  high:   "Priorité haute",
  medium: "Priorité moyenne",
  low:    "Priorité faible",
};
const SEV_STYLE: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-gray-100 text-gray-600",
};
const FLAG_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-500",
  medium: "bg-amber-50 text-amber-500",
  low:    "bg-gray-100 text-gray-500",
};

// Codes motif écrits par le formulaire de signalement. Les signalements
// antérieurs stockaient une phrase libre : on la réaffiche telle quelle.
const REASON_LABEL: Record<string, string> = {
  fausse_photo: "Fausse photo",
  faux_nom:     "Faux nom",
  inapproprie:  "Contenu ou propos inappropriés",
  arnaque:      "Arnaque",
  harcelement:  "Harcèlement",
  autre:        "Autre",
};
const reasonLabel = (reason: string) => REASON_LABEL[reason] ?? reason;

// Nom cliquable qui ouvre la fiche du membre ; inerte si le compte a été
// supprimé entre-temps (plus de fiche à montrer).
function MemberLink({
  name,
  member,
  onOpen,
}: {
  name: string;
  member: MemberRow | null;
  onOpen: () => void;
}) {
  if (!member) {
    return <span className="font-medium text-[var(--color-muted)] italic">{name}</span>;
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-1 font-medium text-[var(--color-brand-600)] hover:underline underline-offset-2"
    >
      {name}
      <ExternalLink className="w-3 h-3 shrink-0" />
    </button>
  );
}

type OpenProfile = { member: MemberRow; subtitle: string };

export function SignalementsClient({ reports }: { reports: ReportRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<OpenProfile | null>(null);

  const visible = reports.filter((r) => !removed.has(r.id));

  const act = (
    r: ReportRow,
    fn: (id: string) => Promise<{ ok: boolean; error?: string }>,
    msg: string,
    type: "success" | "warning" | "error",
  ) => {
    startTransition(async () => {
      const res = await fn(r.id);
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(r.id));
        show(msg, type);
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Signalements</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          À examiner sous 24 h selon les règles métier.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)]">
          <CheckCircle2 className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Aucun signalement en attente</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] shadow-[var(--shadow-card)]">
          {visible.map((r) => (
            <div key={r.id} className="px-4 sm:px-5 py-4">
              {/* Motif, priorité, parties, commentaire */}
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${FLAG_STYLE[r.sev]}`}>
                  <Flag className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[var(--color-ink)]">
                      {reasonLabel(r.reason)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SEV_STYLE[r.sev]}`}>
                      {SEV_LABEL[r.sev]}
                    </span>
                  </div>

                  {/* Qui contre qui — les deux profils s'ouvrent */}
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Signalé par{" "}
                    <MemberLink
                      name={r.reporter}
                      member={r.reporterMember}
                      onOpen={() => r.reporterMember && setProfile({
                        member: r.reporterMember,
                        subtitle: "Auteur du signalement",
                      })}
                    />
                    {" · "}contre{" "}
                    <MemberLink
                      name={r.reported}
                      member={r.reportedMember}
                      onOpen={() => r.reportedMember && setProfile({
                        member: r.reportedMember,
                        subtitle: "Membre signalé",
                      })}
                    />
                    {" · "}
                    <span title={formatDate(r.createdAt)}>{r.when}</span>
                  </p>

                  {/* Commentaire du signaleur — la pièce de la décision */}
                  {r.desc ? (
                    <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3 py-2.5">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                        <Quote className="w-3 h-3" />
                        Motif indiqué par {r.reporter}
                      </p>
                      <p className="text-sm text-[var(--color-ink)] mt-1 leading-relaxed whitespace-pre-wrap break-words">
                        {r.desc}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-[var(--color-muted)]">
                      Aucun commentaire fourni (signalement antérieur au formulaire détaillé).
                    </p>
                  )}
                </div>
              </div>

              {/* Actions : sous le texte, jamais par-dessus */}
              <div className="flex flex-wrap items-center gap-2 mt-3 sm:pl-12">
                <button
                  disabled={busy}
                  onClick={() => act(r, dismissReport, "Signalement ignoré", "success")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-faint)] border border-[var(--color-line)] transition-colors disabled:opacity-50"
                >
                  Ignorer
                </button>
                <button
                  disabled={busy}
                  onClick={() => act(r, warnReportedMember, `Membre averti · ${r.reported}`, "warning")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors disabled:opacity-50"
                >
                  Avertir
                </button>
                <button
                  disabled={busy}
                  onClick={() => act(r, suspendReportedMember, `Compte suspendu · ${r.reported}`, "error")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
                >
                  Suspendre
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {profile && (
        <MemberProfileModal
          member={profile.member}
          subtitle={profile.subtitle}
          onClose={() => setProfile(null)}
        />
      )}
    </div>
  );
}
