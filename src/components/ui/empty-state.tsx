interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[22px] border border-dashed border-border-strong bg-bg-elevated px-5 py-10 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-text-soft">{description}</p>
    </div>
  );
}
