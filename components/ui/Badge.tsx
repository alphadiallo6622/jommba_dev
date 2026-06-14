import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "outline" | "gold";
  icon?: React.ReactNode;
}

export default function Badge({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase select-none";

  const variants = {
    primary: "bg-primary-light text-primary",
    secondary: "bg-jommba-dark text-white",
    outline: "border border-primary/20 bg-transparent text-primary",
    gold: "bg-amber-100 text-amber-800 border border-amber-200/50",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

