"use client";
// app/admin/(protected)/notifications/page.tsx
import { useState } from "react";
import { Send, Megaphone } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { BROADCASTS } from "@/lib/admin/mock-data";
import { useToast } from "@/components/admin/ui/toast";

export default function NotificationsAdminPage() {
  const { show }              = useToast();
  const [title,   setTitle]   = useState("");
  const [message, setMessage] = useState("");
  const [cible,   setCible]   = useState("all");

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
                onChange={(e) => setCible(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] transition"
              >
                <option value="all">Tous les membres (1 945)</option>
                <option value="free">Membres Free (1 511)</option>
                <option value="premium">Membres Premium (434)</option>
                <option value="pending">En attente de validation (7)</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (!title.trim() || !message.trim()) {
                  show("Titre et message requis", "warning");
                  return;
                }
                show("Annonce diffusée", "success");
                setTitle(""); setMessage("");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
            >
              <Send className="w-4 h-4" />
              Diffuser l&apos;annonce
            </button>
          </div>
        </Card>

        {/* Past broadcasts */}
        <Card>
          <CardHeader title="Dernières diffusions" />
          <div className="divide-y divide-[var(--color-line)]">
            {BROADCASTS.map((b) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
