import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[14px] border border-border bg-transparent px-3 text-sm text-text outline-none transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
