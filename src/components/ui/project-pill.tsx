import { cn } from "@/lib/utils";

interface ProjectPillProps {
  name: string;
  color: string;
  className?: string;
}

export function ProjectPill({ name, color, className }: ProjectPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-2.5 py-1 text-xs font-medium text-text-soft",
        className
      )}
    >
      <span className="inline-flex size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}
