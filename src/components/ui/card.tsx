import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren, HTMLAttributes<HTMLElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <section
      className={cn(
        "glass-panel rounded-[22px] p-5 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
