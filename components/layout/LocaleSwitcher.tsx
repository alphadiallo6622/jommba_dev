"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Menu déroulant minimal — pas de dépendance UI externe. */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleChange = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      // Conserve la page courante, change uniquement le préfixe de langue.
      // next-intl met aussi à jour le cookie NEXT_LOCALE automatiquement.
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      <Globe className="w-4 h-4 text-text-muted shrink-0" aria-hidden="true" />
      <label className="sr-only" htmlFor="locale-switcher">{t("label")}</label>
      <select
        id="locale-switcher"
        value={locale}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="appearance-none bg-transparent text-sm font-medium text-text-secondary hover:text-primary focus:outline-none cursor-pointer disabled:opacity-60 pr-1"
        aria-label={t("label")}
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {t(l)}
          </option>
        ))}
      </select>
    </div>
  );
}
