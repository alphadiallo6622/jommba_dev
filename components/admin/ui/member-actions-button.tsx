"use client";
// components/admin/ui/member-actions-button.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal, X, Eye, CheckCircle, Mail, Send,
  Crown, PauseCircle, Trash2,
} from "lucide-react";
import type { MemberRow } from "@/lib/admin/types";
import {
  validateProfile, offerPremium, suspendMember, deleteMember, contactMember,
} from "@/app/adminjommba/actions";
import { useToast } from "./toast";
import { Avatar } from "./avatar";
import { Badge, PremiumBadge } from "./card";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray"> = {
  validated: "green", pending: "amber", refused: "red", suspended: "gray",
};
const STATUS_LABEL: Record<string, string> = {
  validated: "Validé", pending: "En attente", refused: "Refusé", suspended: "Suspendu",
};

type View = "actions" | "profile" | "confirmDelete";

/* ── Modal de contact ────────────────────────────────────────────────────── */
function ContactModal({
  member,
  busy,
  onSend,
  onClose,
}: {
  member: MemberRow;
  busy: boolean;
  onSend: (subject: string, body: string) => void;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");
  const { show } = useToast();

  const handleSend = () => {
    if (!subject.trim()) { show("Le sujet ne peut pas être vide", "warning"); return; }
    if (!body.trim())    { show("Le message ne peut pas être vide", "warning"); return; }
    onSend(subject, body);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Composer */}
      <div
        className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-[var(--color-brand-700)] sm:rounded-t-2xl shrink-0">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Mail className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="flex-1 text-sm font-semibold text-white truncate">
            Contacter {member.name}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/15 text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Meta fields */}
          <div className="divide-y divide-[var(--color-line)] border-b border-[var(--color-line)]">
            {/* De */}
            <div className="flex items-center gap-3 px-5 py-2.5">
              <span className="text-xs font-semibold text-[var(--color-muted)] w-12 shrink-0">De</span>
              <span className="text-sm text-[var(--color-ink)]">contact@jommba.com</span>
            </div>
            {/* À */}
            <div className="flex items-center gap-3 px-5 py-2.5">
              <span className="text-xs font-semibold text-[var(--color-muted)] w-12 shrink-0">À</span>
              <div className="flex items-center gap-2">
                <Avatar name={member.name} size="sm" />
                <span className="text-sm text-[var(--color-ink)] font-medium">{member.name}</span>
                <span className="text-sm text-[var(--color-muted)]">‹{member.email}›</span>
              </div>
            </div>
            {/* Sujet */}
            <div className="flex items-center gap-3 px-5 py-2">
              <span className="text-xs font-semibold text-[var(--color-muted)] w-12 shrink-0">Sujet</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex. À propos de votre profil"
                autoFocus
                className="flex-1 text-sm text-[var(--color-ink)] bg-transparent focus:outline-none placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>

          {/* Message textarea */}
          <div className="px-5 pt-4 pb-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Bonjour ${member.name.split(" ")[0]},\n\n`}
              rows={8}
              className="w-full text-sm text-[var(--color-ink)] placeholder:text-[var(--color-line-2)] bg-transparent focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Signature */}
          <div className="px-5 pb-5 text-xs text-[var(--color-muted)] border-t border-dashed border-[var(--color-line)] pt-3 mt-1">
            <p className="font-medium text-[var(--color-ink)]">Admin Jommba</p>
            <p>Équipe Jommba · contact@jommba.com</p>
            <p className="italic mt-0.5">Jommba — Trouvez votre moitié dans le respect islamique.</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-[var(--color-line)] bg-[var(--color-faint)] sm:rounded-b-2xl shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-white transition-colors"
          >
            Annuler
          </button>
          <button
            disabled={busy}
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {busy ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MemberActionsButton({ member }: { member: MemberRow }) {
  const { show } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("actions");
  const [contacting, setContacting] = useState(false);

  const openModal  = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(true); setView("actions"); };
  const closeModal = () => { setOpen(false); setView("actions"); };

  const handleSendContact = (subject: string, body: string) => {
    startTransition(async () => {
      const res = await contactMember(member.id, subject, body);
      if (res.ok) {
        setContacting(false);
        show(`Message envoyé à ${member.name}`, "success");
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  const act = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    successMsg: string,
    successType: "success" | "warning" | "error" = "success",
  ) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        closeModal();
        show(successMsg, successType);
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  return (
    <>
      <button
        onClick={openModal}
        className="p-1 rounded hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
        aria-label="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeModal} />

          <div
            className={`relative bg-white rounded-2xl w-full shadow-2xl ${view === "profile" ? "max-w-md" : "max-w-xs"}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
              <h3 className="font-semibold text-base text-[var(--color-ink)]">{member.name}</h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {view === "confirmDelete" && (
              <div className="p-5 space-y-3">
                <p className="text-sm text-[var(--color-ink)]">
                  Supprimer définitivement le compte de <strong>{member.name}</strong> ?
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Cette action est irréversible : profil, photos, messages et abonnement seront supprimés.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setView("actions")}
                    className="flex-1 py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    disabled={pending}
                    onClick={() => act(() => deleteMember(member.id), `Compte supprimé · ${member.name}`, "error")}
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {pending ? "Suppression…" : "Supprimer"}
                  </button>
                </div>
              </div>
            )}

            {view === "profile" && (
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Localisation", value: member.location },
                    { label: "Genre",        value: member.gender === "femme" ? "Femme" : member.gender === "homme" ? "Homme" : "—" },
                    { label: "Profession",   value: member.job || "—" },
                    { label: "Études",       value: member.education || "—" },
                    { label: "Situation",    value: member.maritalStatus || "—" },
                    { label: "Madhhab",      value: member.madhhab || "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3 py-2.5">
                      <p className="text-[10px] font-medium text-[var(--color-muted)]">{label}</p>
                      <p className="text-xs font-semibold text-[var(--color-ink)] mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {member.bio && (
                  <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-faint)] px-3 py-2.5">
                    <p className="text-[10px] font-medium text-[var(--color-muted)]">Bio</p>
                    <p className="text-xs text-[var(--color-ink)] mt-0.5 leading-relaxed">{member.bio}</p>
                  </div>
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

                <button
                  onClick={() => setView("actions")}
                  className="w-full py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                >
                  ← Retour aux actions
                </button>
              </div>
            )}

            {view === "actions" && (
              <div className="py-1.5">
                <button
                  onClick={() => setView("profile")}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left text-[var(--color-ink)]"
                >
                  <Eye className="w-4 h-4 shrink-0 text-[var(--color-ink)]" />
                  Voir le profil complet
                </button>

                {member.status !== "validated" && (
                  <button
                    disabled={pending}
                    onClick={() => act(() => validateProfile(member.id), `Profil validé · ${member.name}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left text-emerald-600 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Valider le profil
                  </button>
                )}

                <button
                  onClick={() => { closeModal(); setContacting(true); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left text-[var(--color-ink)]"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  Contacter par email
                </button>

                {member.plan !== "premium" && (
                  <button
                    disabled={pending}
                    onClick={() => act(() => offerPremium(member.id), `Accès Premium offert · ${member.name}`)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left text-amber-500 disabled:opacity-50"
                  >
                    <Crown className="w-4 h-4 shrink-0" />
                    Offrir Premium (1 mois)
                  </button>
                )}

                {member.status !== "suspended" && (
                  <button
                    disabled={pending}
                    onClick={() => act(() => suspendMember(member.id), `Compte suspendu · ${member.name}`, "warning")}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left text-amber-600 disabled:opacity-50"
                  >
                    <PauseCircle className="w-4 h-4 shrink-0" />
                    Suspendre le compte
                  </button>
                )}

                <div className="border-t border-[var(--color-line)] my-1" />

                <button
                  onClick={() => setView("confirmDelete")}
                  className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-red-50 transition-colors text-left text-red-600"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Supprimer le compte
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact modal */}
      {contacting && (
        <ContactModal
          member={member}
          busy={pending}
          onSend={handleSendContact}
          onClose={() => setContacting(false)}
        />
      )}
    </>
  );
}
