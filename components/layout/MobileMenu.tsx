"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export default function MobileMenu({ isOpen, onClose, pathname }: MobileMenuProps) {
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

          {/* Slide-in Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-jommba-bg shadow-2xl z-50 p-6 flex flex-col md:hidden border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-text-muted/10">
              <Link href="/" onClick={onClose} className="flex items-center">
                <img src="/logo.png" alt="Jommba" className="h-9 w-auto" />
              </Link>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-text-primary hover:bg-primary-light hover:text-primary transition-all duration-200"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-4 py-8 flex-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "text-base font-semibold py-2 px-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary-light text-primary"
                        : "text-text-secondary hover:bg-primary-light/50 hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions & Footer */}
            <div className="flex flex-col gap-4 pt-6 border-t border-text-muted/10">
              <Link
                href="/connexion"
                onClick={onClose}
                className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-text-muted/20 text-text-primary font-semibold text-sm hover:bg-primary-light hover:border-primary/30 transition-all duration-200"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                onClick={onClose}
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-green-btn hover:bg-primary-dark transition-all duration-200"
              >
                S'inscrire
              </Link>
              
              <div className="text-center mt-6 text-xs text-text-subtle font-medium">
                « Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité auprès d'elles... »
                <div className="text-[10px] text-primary/70 mt-1">[Sourate Ar-Rum, 21]</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

