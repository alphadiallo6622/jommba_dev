"use client";
// app/adminjommba/(protected)/validation/validation-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, AlertCircle, ImageOff } from "lucide-react";
import type { PendingProfileRow } from "@/lib/admin/types";
import { validateProfile, refuseProfile } from "@/app/adminjommba/actions";
import { useToast } from "@/components/admin/ui/toast";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const REFUSAL_REASONS = [
  "Photo non conforme",
  "Informations incomplètes",
  "Profil suspect / faux",
  "Contenu inapproprié",
  "Autre",
];

function ExamineModal({
  profile,
  busy,
  onValidate,
  onRefuse,
  onClose,
}: {
  profile: PendingProfileRow;
  busy: boolean;
  onValidate: (p: PendingProfileRow) => void;
  onRefuse: (p: PendingProfileRow, reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState(REFUSAL_REASONS[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Green header */}
        <div className="h-24 bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-400)] rounded-t-2xl relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Avatar overlapping */}
          <div className="absolute bottom-0 left-6 translate-y-1/2 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
            {profile.photos[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold text-[var(--color-brand-700)]">
                {initials(profile.name)}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="pt-10 px-6 pb-6 space-y-5">
          {/* Name + meta */}
          <div>
            <h2 className="text-xl font-bold text-[var(--color-ink)]">
              {profile.name}{profile.age != null && `, ${profile.age} ans`}
            </h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              {profile.gender} · {profile.city}, {profile.country} · soumis {profile.sub.toLowerCase()}
            </p>
          </div>

          {/* Info fields 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Profession",      value: profile.job },
              { label: "Niveau d'études", value: profile.edu },
              { label: "Situation",       value: profile.situation },
              { label: "Madhhab",         value: profile.madhhab },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3.5 py-3"
              >
                <p className="text-[10px] font-medium text-[var(--color-muted)] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{value}</p>
              </div>
            ))}
          </div>

          {/* Photos */}
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)] mb-3">
              Photos soumises ({profile.photos.length})
            </p>
            {profile.photos.length === 0 ? (
              <div className="aspect-[3/1] bg-[var(--color-faint)] rounded-xl flex items-center justify-center border border-[var(--color-line)]">
                <span className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <ImageOff className="w-4 h-4" /> Aucune photo soumise
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {profile.photos.map((url, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-faint)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Islamic reminder */}
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Vérifiez que les photos et informations respectent les valeurs islamiques avant publication.
            </p>
          </div>

          {/* Refusal reason */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--color-ink)]">
              Motif (en cas de refus)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
            >
              {REFUSAL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              disabled={busy}
              onClick={() => onRefuse(profile, reason)}
              className="py-3 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Refuser
            </button>
            <button
              disabled={busy}
              onClick={() => onValidate(profile)}
              className="py-3 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
            >
              {busy ? "Traitement…" : "Valider le profil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ValidationClient({ profiles }: { profiles: PendingProfileRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [examining, setExamining] = useState<PendingProfileRow | null>(null);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const visible = profiles.filter((p) => !removed.has(p.userId));

  const handleValidate = (p: PendingProfileRow) => {
    startTransition(async () => {
      const res = await validateProfile(p.userId);
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(p.userId));
        setExamining(null);
        show(`Profil validé · ${p.name}`, "success");
        router.refresh();
      } else {
        show(res.error ?? "Erreur lors de la validation", "error");
      }
    });
  };

  const handleRefuse = (p: PendingProfileRow, reason: string) => {
    startTransition(async () => {
      const res = await refuseProfile(p.userId, reason);
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(p.userId));
        setExamining(null);
        show(`Profil refusé · ${reason}`, "error");
        router.refresh();
      } else {
        show(res.error ?? "Erreur lors du refus", "error");
      }
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">File de validation</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Vérification manuelle de chaque profil avant publication.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            {visible.length} en attente
          </span>
        </div>

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)]">
            <AlertCircle className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Aucun profil en attente de validation</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((p) => (
              <div
                key={p.userId}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] overflow-hidden"
              >
                {/* Photo header */}
                <div className="relative h-28 bg-gradient-to-br from-[var(--color-brand-600)] to-[var(--color-brand-400)] overflow-hidden">
                  {p.photos[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photos[0]}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
                    {p.photos.length} photo{p.photos.length > 1 ? "s" : ""}
                  </span>
                  <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-[var(--color-brand-700)]/70 px-2 py-0.5 rounded-full">
                    {p.sub}
                  </span>
                  <div className="absolute bottom-0 left-4 translate-y-1/2 w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border-2 border-white overflow-hidden">
                    {p.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-[var(--color-brand-700)]">
                        {initials(p.name)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="pt-8 px-4 pb-4 space-y-2.5">
                  <div>
                    <p className="font-semibold text-sm text-[var(--color-ink)]">
                      {p.name}{p.age != null && `, ${p.age}`}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {p.gender} · {p.city}, {p.country}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {p.job} · {p.edu}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setExamining(p)}
                      className="flex-1 py-2 rounded-lg border border-[var(--color-line)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                    >
                      Examiner
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => handleValidate(p)}
                      className="flex-1 py-2 rounded-lg bg-[var(--color-brand-600)] text-white text-xs font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {examining && (
        <ExamineModal
          profile={examining}
          busy={pending}
          onValidate={handleValidate}
          onRefuse={handleRefuse}
          onClose={() => setExamining(null)}
        />
      )}
    </>
  );
}
