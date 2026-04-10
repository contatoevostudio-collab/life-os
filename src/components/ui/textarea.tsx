import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-[14px] border border-border bg-transparent px-3 py-3 text-sm text-text outline-none transition focus:border-accent",
        className
      )}
      {...props}
    />
  );
}
