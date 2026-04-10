import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[14px] border border-border bg-bg-elevated/60 px-3 text-sm text-text outline-none backdrop-blur-sm transition placeholder:text-text-muted focus:border-accent focus:bg-bg-elevated",
        className
      )}
      {...props}
    />
  );
}
