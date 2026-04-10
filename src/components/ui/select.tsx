import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[14px] border border-border bg-transparent px-3 text-sm text-text outline-none transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
