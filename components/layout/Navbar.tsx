"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Menu, LayoutDashboard } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import MobileMenu from "./MobileMenu";
import { LocaleSwitcher } from "./LocaleSwitcher";

export default function Navbar() {
  const t = useTranslations("nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[76px] transition-all duration-300 flex items-center",
          isScrolled
            ? "glass-effect shadow-sm border-b border-white/10"
            : "bg-white md:bg-transparent border-b border-gray-100 md:border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo_jommba.jpeg"
              alt="Jommba"
              className="max-w-none w-[140px] h-auto md:w-auto md:h-14 group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 relative py-2",
                    isActive
                      ? "text-primary"
                      : "text-text-secondary hover:text-primary"
                  )}
                >
                  {t(link.labelKey)}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <LocaleSwitcher />
            {user ? (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-green-btn hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("dashboard")}
              </a>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-sm font-semibold text-text-primary hover:text-primary transition-colors duration-200"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/inscription"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-green-btn hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200"
                >
                  {t("signup")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Dashboard (si connecté) + bouton menu */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white font-semibold text-sm shadow-green-btn hover:bg-primary-dark transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("dashboard")}
              </a>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-text-primary hover:text-primary transition-colors duration-200"
              aria-label={t("openMenu")}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Component */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}
