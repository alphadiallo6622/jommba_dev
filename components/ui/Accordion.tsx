"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function Accordion({
  title,
  children,
  isOpen,
  onToggle,
  className,
}: AccordionProps) {
  return (
    <div
      className={cn(
        "border border-primary-light/40 rounded-2xl bg-white overflow-hidden transition-all duration-200",
        isOpen && "border-primary/20 shadow-green",
        className
      )}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-5 sm:p-6 text-left font-semibold text-text-primary hover:text-primary transition-colors duration-200 select-none"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base pr-4 leading-snug">{title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "p-1 rounded-lg transition-colors duration-200",
            isOpen ? "bg-primary-light text-primary" : "bg-jommba-bg text-text-muted"
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-text-secondary leading-relaxed border-t border-jommba-bg pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

