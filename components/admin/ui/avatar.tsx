// components/admin/ui/avatar.tsx
import { initials } from "@/lib/admin/format";

const SIZES = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export function Avatar({
  name,
  size = "md",
  muted = false,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
}) {
  return (
    <div
      className={`${SIZES[size]} rounded-full flex items-center justify-center font-semibold shrink-0 ${
        muted
          ? "bg-[var(--color-faint)] text-[var(--color-muted)]"
          : "bg-[var(--color-brand-100)] text-[var(--color-brand-700)]"
      }`}
    >
      {initials(name)}
    </div>
  );
}