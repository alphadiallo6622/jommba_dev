"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
              className="h-10 md:h-14 w-auto group-hover:scale-105 transition-transform duration-300"
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
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-fade-in" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/connexion"
              className="text-sm font-semibold text-text-primary hover:text-primary transition-colors duration-200"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-green-btn hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-200"
            >
              S'inscrire
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-text-primary hover:text-primary transition-colors duration-200"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-6 h-6" />
          </button>
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

