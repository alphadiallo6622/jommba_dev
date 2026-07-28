"use client";

import { useTranslations } from "next-intl";
import {
  X,
  Heart,
  PlayCircle,
  Star,
  BookOpen,
  HelpCircle,
  Mail,
  ChevronRight,
  LogIn,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { LocaleSwitcher } from "./LocaleSwitcher";

const LINK_ICONS: Record<string, React.ReactNode> = {
  home: <Heart className="w-4.5 h-4.5" />,
  howToSignup: <PlayCircle className="w-4.5 h-4.5" />,
  pricing: <Star className="w-4.5 h-4.5" />,
  blog: <BookOpen className="w-4.5 h-4.5" />,
  faq: <HelpCircle className="w-4.5 h-4.5" />,
  contact: <Mail className="w-4.5 h-4.5" />,
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
  const t = useTranslations("nav");
  const { user } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-jommba-dark/40 backdrop-blur-sm z-50 md:hidden"
          />

          {/* Slide-in Menu Panel — fond vert dégradé, style carte */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[330px] max-w-[88vw] bg-gradient-to-b from-primary-dark via-primary-dark to-primary z-50 p-5 flex flex-col md:hidden shadow-2xl overflow-y-auto"
          >
            {/* Header : logo + fermeture */}
            <div className="flex items-center justify-between">
              <Link href="/" onClick={onClose} className="flex items-center">
                <img
                  src="/logo_jommba_fond_transparent.png"
                  alt="Jommba"
                  className="max-w-none w-[120px] h-auto rounded-lg"
                />
              </Link>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200"
                aria-label={t("closeMenu")}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Séparateur décoratif */}
            <div className="flex items-center gap-3 py-4">
              <Sparkles className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <div className="flex-1 border-t border-dashed border-white/20" />
              <Sparkles className="w-3.5 h-3.5 text-white/40 shrink-0" />
            </div>

            {/* Liens en cartes */}
            <nav className="flex flex-col gap-2.5 flex-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200",
                      isActive
                        ? "bg-white/20 border-white/30 shadow-inner"
                        : "bg-white/8 border-white/10 hover:bg-white/15 hover:border-white/20"
                    )}
                  >
                    <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white/90 shrink-0">
                      {LINK_ICONS[link.labelKey] ?? <Heart className="w-4.5 h-4.5" />}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-white">
                      {t(link.labelKey)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
                  </Link>
                );
              })}
            </nav>

            {/* Séparateur cœur */}
            <div className="flex items-center gap-3 py-4">
              <div className="flex-1 border-t border-dashed border-white/20" />
              <Heart className="w-3.5 h-3.5 text-white/40 fill-white/30 shrink-0" />
              <div className="flex-1 border-t border-dashed border-white/20" />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-center">
                <LocaleSwitcher />
              </div>

              {user ? (
                <a
                  href="/dashboard"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-primary font-bold text-sm shadow-lg hover:bg-jommba-bg transition-all duration-200"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("dashboard")}
                </a>
              ) : (
                <>
                  <Link
                    href="/connexion"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-white/25 bg-white/5 text-white font-semibold text-sm hover:bg-white/15 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4" />
                    {t("login")}
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white text-primary font-bold text-sm shadow-lg hover:bg-jommba-bg transition-all duration-200"
                  >
                    <Heart className="w-4 h-4 fill-primary" />
                    {t("signup")}
                  </Link>
                </>
              )}

              <div className="text-center mt-3 text-[11px] text-white/60 font-medium leading-relaxed">
                {t("quote")}
                <div className="text-[10px] text-white/40 mt-1">{t("quoteSource")}</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
