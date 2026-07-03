"use client";
// components/admin/topbar.tsx
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Bell, Menu, Search, ChevronDown, LogOut, KeyRound, Settings, HelpCircle, X, Eye, EyeOff } from "lucide-react";
import { NAV } from "@/lib/admin/nav";
import type { AdminNotification, AdminIdentity } from "@/lib/admin/types";
import { initials } from "@/lib/admin/format";
import { changeMyPassword } from "@/app/adminjommba/actions";
import { useToast } from "./ui/toast";
import { usePathname, useRouter } from "next/navigation";

function useCurrentPage() {
  const pathname = usePathname();
  for (const section of NAV) {
    for (const item of section.items) {
      if (item.href === pathname) {
        return { title: item.label, desc: item.desc ?? section.title };
      }
    }
  }
  return { title: "Admin", desc: "Jommba" };
}

function getIcon(name: string): LucideIcons.LucideIcon {
  const pascal = name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
  return (
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[pascal] ??
    LucideIcons.Bell
  );
}

const NOTIF_BG: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red:   "bg-red-50 text-red-600",
};

interface SearchResult {
  id: string;
  name: string;
  email: string;
  location: string;
  status: string;
}

const SEARCH_STATUS_LABEL: Record<string, string> = {
  validated: "Validé", pending: "En attente", refused: "Refusé", suspended: "Suspendu",
};

/* ── Modal changement de mot de passe ────────────────────────────────────── */
function PasswordModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast();
  const [busy, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next,    setNext]    = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    if (next.length < 8) {
      show("Le nouveau mot de passe doit contenir au moins 8 caractères", "warning");
      return;
    }
    if (next !== confirm) {
      show("Les deux mots de passe ne correspondent pas", "warning");
      return;
    }
    startTransition(async () => {
      const res = await changeMyPassword(current, next);
      if (res.ok) {
        show("Mot de passe modifié", "success");
        onClose();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  const inputCls =
    "w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
              <KeyRound className="w-3.5 h-3.5 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-sm font-bold text-[var(--color-ink)]">Changer mon mot de passe</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Mot de passe actuel</label>
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                autoComplete="new-password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                placeholder="8 caractères minimum"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
              >
                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Confirmer le nouveau mot de passe</label>
            <input
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
            />
          </div>
          <button
            disabled={busy}
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
          >
            {busy ? "Modification…" : "Modifier le mot de passe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Topbar({
  onMenuClick,
  notifications,
  identity,
}: {
  onMenuClick?: () => void;
  notifications: AdminNotification[];
  identity: AdminIdentity;
}) {
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState<SearchResult[] | null>(null);
  const [searching, setSearching]     = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router  = useRouter();
  const page    = useCurrentPage();
  const unread  = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/adminjommba/login");
  };

  const closeAll = () => {
    setShowNotifs(false);
    setShowProfile(false);
    setResults(null);
  };

  // Recherche membres — debounce 300 ms (déclenchée depuis onChange, pas d'effet)
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const q = value.trim();
    if (q.length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = (await res.json()) as { results: SearchResult[] };
          setResults(data.results);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const goToMember = () => {
    setResults(null);
    setQuery("");
    router.push(`/adminjommba/membres?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="h-14 bg-[var(--color-surface)] border-b border-[var(--color-line)] flex items-center px-4 gap-3 relative z-20">
      {/* Mobile toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-faint)] transition-colors shrink-0"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5 text-[var(--color-ink)]" />
      </button>

      {/* Page title — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-center shrink-0">
        <span className="text-sm font-bold text-[var(--color-ink)] leading-tight">{page.title}</span>
        <span className="text-[11px] text-[var(--color-muted)] leading-tight">{page.desc}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:block">
        <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-faint)] w-52 focus-within:border-[var(--color-brand-400)] transition-colors">
          <Search className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && query.trim().length >= 2) goToMember(); }}
            placeholder="Rechercher un membre, email…"
            className="flex-1 text-xs bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] min-w-0"
          />
        </div>

        {(results !== null || searching) && query.trim().length >= 2 && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setResults(null)} />
            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl shadow-[var(--shadow-pop)] z-40 overflow-hidden">
              {searching ? (
                <p className="px-4 py-3 text-xs text-[var(--color-muted)]">Recherche…</p>
              ) : results && results.length > 0 ? (
                <>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-line)]">
                    {results.map((r) => (
                      <button
                        key={r.id}
                        onClick={goToMember}
                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-[var(--color-faint)] transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--color-ink)] truncate">{r.name}</p>
                          <p className="text-xs text-[var(--color-muted)] truncate">{r.email} · {r.location}</p>
                        </div>
                        <span className="text-[10px] text-[var(--color-muted)] shrink-0">
                          {SEARCH_STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={goToMember}
                    className="w-full px-4 py-2.5 text-xs font-medium text-[var(--color-brand-600)] hover:bg-[var(--color-faint)] transition-colors border-t border-[var(--color-line)] text-left"
                  >
                    Voir tous les résultats →
                  </button>
                </>
              ) : (
                <p className="px-4 py-3 text-xs text-[var(--color-muted)]">Aucun membre trouvé</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
          className="relative p-1.5 rounded-lg hover:bg-[var(--color-faint)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-[var(--color-ink)]" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <>
            <div className="fixed inset-0 z-30" onClick={closeAll} />
            <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl shadow-[var(--shadow-pop)] z-40">
              <div className="px-4 py-3 border-b border-[var(--color-line)] flex items-center justify-between">
                <span className="font-semibold text-sm text-[var(--color-ink)]">Notifications</span>
                {unread > 0 && (
                  <span className="text-xs text-[var(--color-brand-600)] font-medium">{unread} à traiter</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-line)]">
                {notifications.map((n) => {
                  const Icon = getIcon(n.icon);
                  const inner = (
                    <>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${NOTIF_BG[n.tone]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--color-ink)] leading-snug">{n.text}</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">{n.when}</p>
                      </div>
                    </>
                  );
                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={closeAll}
                      className={`px-4 py-3 flex items-start gap-3 hover:bg-[var(--color-faint)] transition-colors ${!n.read ? "bg-[var(--color-brand-50)]" : ""}`}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex items-start gap-3 ${!n.read ? "bg-[var(--color-brand-50)]" : ""}`}
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--color-faint)] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[var(--color-brand-600)] flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">{initials(identity.name)}</span>
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-semibold text-[var(--color-ink)] leading-tight">{identity.name}</span>
            <span className="text-[10px] text-[var(--color-muted)] leading-tight">{identity.role}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-muted)] hidden sm:block" />
        </button>

        {showProfile && (
          <>
            <div className="fixed inset-0 z-30" onClick={closeAll} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl shadow-[var(--shadow-pop)] z-40 overflow-hidden">
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-line)]">
                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-600)] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{initials(identity.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">{identity.name}</p>
                  <p className="text-xs text-[var(--color-muted)] truncate">{identity.email}</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {identity.isMaster ? (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-muted)] cursor-not-allowed opacity-60" title="Le mot de passe du compte principal se gère dans les variables d'environnement (.env)">
                    <KeyRound className="w-4 h-4 shrink-0" />
                    <span className="flex-1">Mot de passe géré en .env</span>
                  </div>
                ) : (
                  <button
                    onClick={() => { closeAll(); setShowPassword(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
                    Changer mon mot de passe
                  </button>
                )}
                {([
                  { icon: Settings,    label: "Paramètres",    href: "/adminjommba/parametres" },
                  { icon: HelpCircle,  label: "Centre d'aide", href: "/adminjommba/support"    },
                ] as const).map(({ icon: Icon, label, href }) => (
                  <button
                    key={label}
                    onClick={() => { closeAll(); if (href) router.push(href); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
                    {label}
                  </button>
                ))}

                <div className="border-t border-[var(--color-line)] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Déconnexion
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal changement de mot de passe */}
      {showPassword && <PasswordModal onClose={() => setShowPassword(false)} />}
    </header>
  );
}
