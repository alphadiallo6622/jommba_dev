"use client";
// components/admin/sidebar.tsx
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV } from "@/lib/admin/nav";
import { LogOut } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const BADGE_STYLE: Record<string, string> = {
  amber: "bg-amber-400/25 text-amber-200",
  red:   "bg-red-400/25 text-red-300",
  green: "bg-emerald-400/25 text-emerald-300",
};

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/adminjommba/login");
  };

  return (
    <aside className="w-60 h-full flex flex-col" style={{ background: "#162820" }}>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm leading-none">J</span>
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">Jommba</p>
            <p className="text-[10px] text-white/45 tracking-widest uppercase">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 px-2 mb-1">
              {section.title}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon as LucideIcon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/65 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${BADGE_STYLE[item.badge.tone]}`}>
                      {item.badge.value}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-600)] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">AJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">Admin Jommba</p>
            <p className="text-[11px] text-white/45 truncate">super-admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
