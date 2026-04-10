import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-panel/80 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(75,136,220,0.08)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <h2 className="text-[2rem] font-semibold tracking-[-0.07em] md:text-[2.45rem]">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-[0.95rem] leading-7 text-text-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
