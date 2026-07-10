"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/* Drapeaux en SVG inline — les emoji drapeaux ne s'affichent pas sous Windows/Chrome. */
function FlagFR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="8" height="16" fill="#0055A4" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#EF4135" />
    </svg>
  );
}

function FlagEN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} aria-hidden="true">
      <rect width="24" height="16" fill="#012169" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12,0 V16 M0,8 H24" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="3" />
    </svg>
  );
}

const LOCALE_META: Record<string, { Flag: typeof FlagFR; short: string }> = {
  fr: { Flag: FlagFR, short: "FR" },
  en: { Flag: FlagEN, short: "EN" },
};

/** Sélecteur de langue avec drapeau + code (FR / EN). */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChange = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      // Conserve la page courante, change uniquement le préfixe de langue.
      // next-intl met aussi à jour le cookie NEXT_LOCALE automatiquement.
      router.replace(pathname, { locale: next });
    });
  };

  const current = LOCALE_META[locale] ?? LOCALE_META.fr;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={pending}
        aria-label={t("label")}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-text-muted/15 bg-white/60 text-sm font-semibold text-text-secondary hover:text-primary hover:border-primary/30 transition-all duration-200 disabled:opacity-60 cursor-pointer"
      >
        <current.Flag className="w-5 h-auto rounded-[2px] shadow-sm shrink-0" />
        <span>{current.short}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-text-muted transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-text-muted/10 bg-white shadow-lg overflow-hidden z-50 py-1 animate-fade-in-up">
          {routing.locales.map((l) => {
            const meta = LOCALE_META[l] ?? LOCALE_META.fr;
            const isActive = l === locale;
            return (
              <button
                key={l}
                type="button"
                onClick={() => handleChange(l)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer",
                  isActive ? "text-primary bg-primary-light/50" : "text-text-secondary hover:bg-primary-light/30 hover:text-primary"
                )}
              >
                <meta.Flag className="w-5 h-auto rounded-[2px] shadow-sm shrink-0" />
                <span className="flex-1 text-left">{t(l)}</span>
                {isActive && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
