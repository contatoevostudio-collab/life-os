interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="editorial-surface rounded-[28px] border border-dashed px-6 py-10 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[radial-gradient(circle,rgba(75,136,220,0.18),rgba(75,136,220,0.04))]" />
      <p className="text-xl font-semibold tracking-[-0.04em]">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-soft">{description}</p>
    </div>
  );
}
