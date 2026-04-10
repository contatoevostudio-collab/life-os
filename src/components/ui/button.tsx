"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-[linear-gradient(180deg,rgba(59,130,246,1),rgba(37,99,235,1))] text-white hover:brightness-105 dark:text-slate-950 shadow-[0_10px_24px_rgba(37,99,235,0.18)]",
  secondary:
    "border border-border-strong bg-bg-elevated text-text hover:bg-bg-panel hover:border-border",
  ghost: "text-text-soft hover:bg-accent-soft hover:text-text",
  danger: "bg-[linear-gradient(180deg,rgba(239,68,68,1),rgba(220,38,38,1))] text-white hover:brightness-105"
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
        styles[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
}
