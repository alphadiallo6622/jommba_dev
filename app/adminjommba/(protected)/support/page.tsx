"use client";
// app/admin/(protected)/support/page.tsx
import { useState } from "react";
import { X, Mail, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar } from "@/components/admin/ui/avatar";
import { SUPPORT_TICKETS, type SupportTicket, type TicketStatus } from "@/lib/admin/mock-data";
import { useToast } from "@/components/admin/ui/toast";

const STATUS_STYLE: Record<TicketStatus, string> = {
  open:     "bg-emerald-50 text-emerald-700",
  resolved: "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<TicketStatus, string> = {
  open:     "Ouvert",
  resolved: "Résolu",
};

/* ── Reply modal ─────────────────────────────────────────────────────────── */
function ReplyModal({
  ticket,
  onSend,
  onClose,
}: {
  ticket: SupportTicket;
  onSend: (body: string) => void;
  onClose: () => void;
}) {
  const [subject,    setSubject]    = useState(`Re : ${ticket.title}`);
  const [body,       setBody]       = useState("");
  const [showThread, setShowThread] = useState(false);
  const { show } = useToast();

  const handleSend = () => {
    if (!body.trim()) {
      show("Le message ne peut pas être vide", "warning");
      return;
    }
    onSend(body);
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
            Répondre à {ticket.name}
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
              <span className="text-sm text-[var(--color-ink)]">support@jommba.com</span>
            </div>
            {/* À */}
            <div className="flex items-center gap-3 px-5 py-2.5">
              <span className="text-xs font-semibold text-[var(--color-muted)] w-12 shrink-0">À</span>
              <div className="flex items-center gap-2">
                <Avatar name={ticket.name} size="sm" />
                <span className="text-sm text-[var(--color-ink)] font-medium">{ticket.name}</span>
                <span className="text-sm text-[var(--color-muted)]">‹{ticket.email}›</span>
              </div>
            </div>
            {/* Sujet */}
            <div className="flex items-center gap-3 px-5 py-2">
              <span className="text-xs font-semibold text-[var(--color-muted)] w-12 shrink-0">Sujet</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 text-sm text-[var(--color-ink)] bg-transparent focus:outline-none placeholder:text-[var(--color-muted)]"
              />
            </div>
          </div>

          {/* Reply textarea */}
          <div className="px-5 pt-4 pb-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Bonjour ${ticket.name.split(" ")[0]},\n\nMerci de nous avoir contactés…`}
              rows={8}
              autoFocus
              className="w-full text-sm text-[var(--color-ink)] placeholder:text-[var(--color-line-2)] bg-transparent focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Signature */}
          <div className="px-5 pb-3 text-xs text-[var(--color-muted)] border-t border-dashed border-[var(--color-line)] pt-3 mt-1">
            <p className="font-medium text-[var(--color-ink)]">Admin Jommba</p>
            <p>Équipe Support · support@jommba.com</p>
            <p className="italic mt-0.5">Jommba — Trouvez votre moitié dans le respect islamique.</p>
          </div>

          {/* Thread toggle */}
          <button
            onClick={() => setShowThread((v) => !v)}
            className="w-full flex items-center gap-2 px-5 py-3 text-xs text-[var(--color-muted)] hover:bg-[var(--color-faint)] transition-colors border-t border-[var(--color-line)]"
          >
            {showThread ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Message original de {ticket.name}
          </button>

          {showThread && (
            <div className="px-5 pb-5 bg-[var(--color-faint)] border-t border-[var(--color-line)]">
              <div className="mt-3 flex items-start gap-3">
                <Avatar name={ticket.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-ink)]">
                    {ticket.name}
                    <span className="font-normal text-[var(--color-muted)] ml-2">{ticket.when}</span>
                  </p>
                  <p className="text-xs text-[var(--color-ink)] mt-1.5 leading-relaxed bg-white border border-[var(--color-line)] rounded-xl px-4 py-3">
                    {ticket.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-[var(--color-line)] bg-[var(--color-faint)] sm:rounded-b-2xl shrink-0">
          <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <span className="px-2 py-0.5 rounded-full border border-[var(--color-line)] bg-white font-medium capitalize">
              {ticket.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SupportPage() {
  const { show } = useToast();
  const [tickets, setTickets]   = useState(SUPPORT_TICKETS);
  const [replying, setReplying] = useState<SupportTicket | null>(null);

  const handleSend = (body: string) => {
    if (!replying) return;
    setTickets((prev) =>
      prev.map((t) => t.id === replying.id ? { ...t, status: "resolved" as TicketStatus } : t),
    );
    show(`Réponse envoyée à ${replying.name}`, "success");
    setReplying(null);
  };

  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">Support utilisateurs</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Tickets entrants — support@jommba.com
            </p>
          </div>
          {openCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
              {openCount} ouvert{openCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] shadow-[var(--shadow-card)]">
          {tickets.map((t) => (
            <div key={t.id} className="flex items-center gap-4 px-5 py-4">
              <Avatar name={t.name} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-[var(--color-ink)]">{t.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>
                    {STATUS_LABEL[t.status]}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">
                  {t.name} · {t.category} · {t.when}
                </p>
              </div>

              <button
                onClick={() => setReplying(t)}
                className="px-4 py-1.5 rounded-lg border border-[var(--color-line)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors shrink-0"
              >
                Répondre
              </button>
            </div>
          ))}
        </div>
      </div>

      {replying && (
        <ReplyModal
          ticket={replying}
          onSend={handleSend}
          onClose={() => setReplying(null)}
        />
      )}
    </>
  );
}
