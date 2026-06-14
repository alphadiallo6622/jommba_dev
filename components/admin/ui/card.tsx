// components/admin/ui/card.tsx
import { Crown } from "lucide-react";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-card)] border border-[var(--color-line)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
      <h3 className="font-semibold text-sm text-[var(--color-ink)]">{title}</h3>
      {action}
    </div>
  );
}

type Tone = "green" | "amber" | "red" | "blue" | "gray";

const TONE: Record<Tone, string> = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({
  label,
  tone = "gray",
}: {
  label: string | number;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${TONE[tone]}`}
    >
      {label}
    </span>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
      <Crown className="w-2.5 h-2.5" />
      PREMIUM
    </span>
  );
}