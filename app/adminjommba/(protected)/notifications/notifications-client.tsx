"use client";
// app/adminjommba/(protected)/notifications/notifications-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Megaphone } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import type { BroadcastRow, BroadcastTargetCounts } from "@/lib/admin/types";
import type { BroadcastTarget } from "@/lib/supabase/types";
import { sendBroadcast } from "@/app/adminjommba/actions";
import { useToast } from "@/components/admin/ui/toast";

export function NotificationsClient({
  broadcasts,
  targets,
}: {
  broadcasts: BroadcastRow[];
  targets: BroadcastTargetCounts;
}) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [cible,   setCible]   = useState<BroadcastTarget>("all");

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      show("Titre et message requis", "warning");
      return;
    }
    startTransition(async () => {
      const res = await sendBroadcast(title, message, cible);
      if (res.ok) {
        show("Annonce diffusée", "success");
        setTitle("");
        setMessage("");
        router.refresh();
      } else {
        show(res.error ?? "Erreur lors de la diffusion", "error");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Notifications système</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Diffusion d&apos;une annonce à un segment de membres.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Compose form */}
        <Card className="lg:col-span-2">
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Titre</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. Nouvelle fonctionnalité disponible"
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Cible</label>
              <select
                value={cible}
                onChange={(e) => setCible(e.target.value as BroadcastTarget)}
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
              >
                <option value="all">Tous les membres ({fmt(targets.all)})</option>
                <option value="free">Membres Free ({fmt(targets.free)})</option>
                <option value="premium">Membres Premium ({fmt(targets.premium)})</option>
                <option value="pending">En attente de validation ({fmt(targets.pending)})</option>
              </select>
            </div>

            <button
              disabled={busy}
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {busy ? "Diffusion en cours…" : "Diffuser l'annonce"}
            </button>
          </div>
        </Card>

        {/* Past broadcasts */}
        <Card>
          <CardHeader title="Dernières diffusions" />
          <div className="divide-y divide-[var(--color-line)]">
            {broadcasts.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[var(--color-muted)] text-center">
                Aucune diffusion pour le moment
              </p>
            ) : (
              broadcasts.map((b) => (
                <div key={b.id} className="flex items-start gap-3 px-4 py-3.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--color-brand-50)] flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone className="w-3.5 h-3.5 text-[var(--color-brand-600)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] leading-snug">{b.title}</p>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">{b.target}</p>
                    <p className="text-xs text-[var(--color-muted)]">{b.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
