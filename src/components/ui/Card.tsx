"use client";

import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
};

export function Card({
  padding = "md",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl bg-[var(--card)] shadow-sm
        border border-[var(--border)]
        transition-all duration-300
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    />
  );
}
