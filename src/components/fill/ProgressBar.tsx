interface ProgressBarProps {
  answered: number;
  total: number;
}

export function ProgressBar({ answered, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="sticky top-14 mb-4 py-3 pb-3.5 bg-gradient-to-b from-bg from-70% to-transparent z-progress">
      <div className="flex justify-between font-mono text-label text-muted mb-1.5 uppercase tracking-wide">
        <span>{answered} of {total} answered</span>
        <span>{pct}% complete</span>
      </div>
      <div
        className="h-1 bg-surface-3 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% complete`}
      >
        <div
          className="h-full bg-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
