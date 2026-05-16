interface ToggleProps {
  on: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  sub?: string;
  disabled?: boolean;
}

export function Toggle({ on, onChange, label, sub, disabled }: ToggleProps) {
  function handleToggle() {
    if (!disabled) onChange(!on);
  }
  const handle = (
    <span
      className="toggle"
      data-on={on}
      role="switch"
      aria-checked={on}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={(e) => { if (!disabled && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); onChange(!on); } }}
      style={disabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
    />
  );
  if (label) {
    return (
      <div className="flex items-center justify-between gap-3 py-1.5">
        <div>
          <div className="text-ui text-ink">{label}</div>
          {sub && <div className="text-caption text-muted mt-0.5">{sub}</div>}
        </div>
        {handle}
      </div>
    );
  }
  return handle;
}
