interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-border-strong bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.12))] px-5 py-10 text-center dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
      <p className="text-lg font-medium tracking-[-0.02em]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-soft">{description}</p>
    </div>
  );
}
