import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[14px] border border-border bg-bg-elevated/60 px-3 text-sm text-text outline-none backdrop-blur-sm transition focus:border-accent focus:bg-bg-elevated",
        className
      )}
      {...props}
    />
  );
}
