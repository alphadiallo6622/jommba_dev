"use client";
// components/admin/topbar.tsx
import { useState } from "react";
import { Bell, Menu, Search, ChevronDown, LogOut, User, Settings, HelpCircle } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/admin/mock-data";
import { NAV } from "@/lib/admin/nav";
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

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const router  = useRouter();
  const page    = useCurrentPage();
  const unread  = NOTIFICATIONS.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/adminjommba/login");
  };

  const closeAll = () => { setShowNotifs(false); setShowProfile(false); };

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
      <div className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-faint)] w-52 focus-within:border-[var(--color-brand-400)] transition-colors">
        <Search className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
        <input
          type="text"
          placeholder="Rechercher un membre, email…"
          className="flex-1 text-xs bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-muted)] min-w-0"
        />
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
                  <span className="text-xs text-[var(--color-brand-600)] font-medium">{unread} non lues</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-line)]">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 flex items-start gap-3 ${!n.read ? "bg-[var(--color-brand-50)]" : ""}`}
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-[var(--color-brand-600)]" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--color-ink)] leading-snug">{n.text}</p>
                      <p className="text-xs text-[var(--color-muted)] mt-0.5">{n.when}</p>
                    </div>
                  </div>
                ))}
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
            <span className="text-white text-[10px] font-bold">AJ</span>
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-semibold text-[var(--color-ink)] leading-tight">Admin Jommba</span>
            <span className="text-[10px] text-[var(--color-muted)] leading-tight">super-admin</span>
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
                  <span className="text-white text-xs font-bold">AJ</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-ink)] truncate">Admin Jommba</p>
                  <p className="text-xs text-[var(--color-muted)] truncate">admin@jommba.com</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {([
                  { icon: User,        label: "Mon profil",    href: null                },
                  { icon: Settings,    label: "Paramètres",    href: "/adminjommba/parametres" },
                  { icon: HelpCircle,  label: "Centre d'aide", href: null                },
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
    </header>
  );
}
