import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "dark";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  href?: string;
}

export default function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  loading = false,
  href,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none select-none";

  const variants = {
    primary:
      "bg-primary text-white shadow-green-btn hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
    secondary:
      "border border-primary/20 bg-primary-light/10 text-primary hover:bg-primary-light/40 hover:border-primary/40 active:bg-primary-light/60",
    ghost:
      "text-text-primary hover:bg-primary-light/30 hover:text-primary active:bg-primary-light/50",
    dark:
      "bg-jommba-dark text-white hover:bg-jommba-dark/95 hover:-translate-y-0.5 active:translate-y-0",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && iconPosition === "left" && (
        <span className="mr-2 inline-flex">{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="ml-2 inline-flex">{icon}</span>
      )}
    </>
  );

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    // If it's a link, we need to pass a valid Anchor element or use Link
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={classes} {...props}>
      {content}
    </button>
  );
}

