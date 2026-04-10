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
      <div className="space-y-2">
        {eyebrow ? (
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
              {eyebrow}
            </p>
          </div>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-[-0.05em] md:text-[2rem]">{title}</h2>
        {description ? (
          <p className="max-w-2xl text-sm text-text-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
