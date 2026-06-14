import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
}

export default function SectionHeading({
  className,
  title,
  subtitle,
  badge,
  align = "center",
  theme = "light",
  ...props
}: SectionHeadingProps) {
  const aligns = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col space-y-4 max-w-3xl mx-auto", aligns[align], className)}
      {...props}
    >
      {badge && (
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase",
            theme === "light"
              ? "bg-primary-light text-primary"
              : "bg-white/10 text-white"
          )}
        >
          {badge}
        </span>
      )}
      
      <h2
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight tracking-tight",
          theme === "light" ? "text-text-primary" : "text-white"
        )}
      >
        {title}
      </h2>
      
      {subtitle && (
        <p
          className={cn(
            "text-base sm:text-lg leading-relaxed max-w-2xl",
            theme === "light" ? "text-text-muted" : "text-white/80"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
