interface ToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  sub?: string;
}

export function Toggle({ on, onChange, label, sub }: ToggleProps) {
  if (label) {
    return (
      <div className="flex items-center justify-between gap-3 py-1.5">
        <div>
          <div className="text-ui text-ink">{label}</div>
          {sub && <div className="text-caption text-muted mt-0.5">{sub}</div>}
        </div>
        <span
          className="toggle"
          data-on={on}
          role="switch"
          aria-checked={on}
          tabIndex={0}
          onClick={() => onChange(!on)}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!on); } }}
        />
      </div>
    );
  }
  return (
    <span
      className="toggle"
      data-on={on}
      role="switch"
      aria-checked={on}
      tabIndex={0}
      onClick={() => onChange(!on)}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!on); } }}
    />
  );
}
