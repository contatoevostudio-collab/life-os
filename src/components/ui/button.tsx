"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:opacity-90 dark:text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]",
  secondary:
    "border border-border-strong bg-bg-elevated text-text hover:bg-bg-panel",
  ghost: "text-text-soft hover:bg-accent-soft hover:text-text",
  danger: "bg-danger text-white hover:opacity-90"
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
        "inline-flex h-10 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        styles[variant],
        className
      )}
      type={type}
      {...props}
    />
  );
}
