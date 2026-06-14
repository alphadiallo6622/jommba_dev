"use client";

import { User, ShieldAlert, MessageSquare, Star, Lock, LucideIcon } from "lucide-react";
import { FAQCategory } from "@/data/faqData";
import { cn } from "@/lib/utils";

interface FAQCategoriesProps {
  categories: FAQCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  User,
  ShieldAlert,
  MessageSquare,
  Star,
  Lock,
};

export default function FAQCategories({
  categories,
  activeCategoryId,
  onSelectCategory,
}: FAQCategoriesProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {categories.map((category) => {
        const IconComponent = iconMap[category.iconName] || User;
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 border select-none",
              isActive
                ? "bg-primary text-white border-primary shadow-green-btn"
                : "bg-white text-text-secondary border-primary-light/45 hover:bg-primary-light/30 hover:text-primary"
            )}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
