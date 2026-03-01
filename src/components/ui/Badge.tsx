"use client";

import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning";
}

const variantStyles = {
  default: "bg-[var(--border)] text-[var(--text-secondary)]",
  primary: "bg-[var(--primary-light)] text-[var(--primary-hover)]",
  success: "bg-[var(--success)]/40 text-[var(--text-primary)]",
  warning: "bg-[var(--warning)]/40 text-[var(--text-primary)]",
};

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
