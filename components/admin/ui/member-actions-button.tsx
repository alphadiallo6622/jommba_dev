"use client";
// components/admin/ui/member-actions-button.tsx
import { useState } from "react";
import {
  MoreHorizontal, X, Eye, CheckCircle, Mail,
  Crown, PauseCircle, Trash2,
} from "lucide-react";
import type { Member } from "@/lib/admin/mock-data";
import { useToast, type ToastType } from "./toast";

const ACTIONS: {
  icon: typeof Eye;
  label: string;
  cls: string;
  toast: string;
  toastType: ToastType;
  confirm: boolean;
}[] = [
  {
    icon: Eye,         label: "Voir le profil complet",
    cls: "text-[var(--color-ink)]", toast: "",             toastType: "success", confirm: false,
  },
  {
    icon: CheckCircle, label: "Valider le profil",
    cls: "text-emerald-600",        toast: "Profil validé", toastType: "success", confirm: false,
  },
  {
    icon: Mail,        label: "Contacter par email",
    cls: "text-[var(--color-ink)]", toast: "Email envoyé", toastType: "success", confirm: false,
  },
  {
    icon: Crown,       label: "Offrir Premium",
    cls: "text-amber-500",          toast: "Accès Premium activé", toastType: "success", confirm: false,
  },
  {
    icon: PauseCircle, label: "Suspendre le compte",
    cls: "text-amber-600",          toast: "Compte suspendu", toastType: "warning", confirm: false,
  },
  {
    icon: Trash2,      label: "Supprimer le compte",
    cls: "text-red-600",            toast: "Compte supprimé", toastType: "error",   confirm: true,
  },
];

export function MemberActionsButton({ member }: { member: Member }) {
  const { show }                      = useToast();
  const [open, setOpen]               = useState(false);
  const [confirmDelete, setConfirm]   = useState(false);

  const openModal  = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(true); setConfirm(false); };
  const closeModal = () => { setOpen(false); setConfirm(false); };

  const handleAction = (toast: string, toastType: ToastType, confirm: boolean) => {
    if (confirm) { setConfirm(true); return; }
    closeModal();
    if (toast) show(toast, toastType);
  };

  const handleDelete = () => {
    closeModal();
    show("Compte supprimé", "error");
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
            className="relative bg-white rounded-2xl w-full max-w-xs shadow-2xl"
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

            {confirmDelete ? (
              <div className="p-5 space-y-3">
                <p className="text-sm text-[var(--color-ink)]">
                  Supprimer définitivement le compte de <strong>{member.name}</strong> ?
                </p>
                <p className="text-xs text-[var(--color-muted)]">Cette action est irréversible.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-1.5">
                {ACTIONS.map(({ icon: Icon, label, cls, toast, toastType, confirm }) => (
                  <button
                    key={label}
                    onClick={() => handleAction(toast, toastType, confirm)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-sm hover:bg-[var(--color-faint)] transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${cls}`} />
                    <span className={cls}>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
