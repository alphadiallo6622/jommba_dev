import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
  className,
  hover = false,
  glass = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4 sm:p-5",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 relative overflow-hidden",
        // Default styling
        glass
          ? "glass-effect"
          : "bg-white border-primary-light/40 shadow-sm",
        // Hover effects
        hover && (
          glass
            ? "hover:-translate-y-1.5 hover:shadow-green hover:border-primary/20"
            : "hover:-translate-y-1.5 hover:shadow-green hover:border-primary/10"
        ),
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
