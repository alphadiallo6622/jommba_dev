import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export default function Container({
  className,
  size = "lg",
  children,
  ...props
}: ContainerProps) {
  const maxWidths = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
  };

  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 w-full",
        maxWidths[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
