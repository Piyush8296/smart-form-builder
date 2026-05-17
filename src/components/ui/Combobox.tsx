import { useState, useRef, useEffect, useId, useMemo, type KeyboardEvent } from 'react';
import { cn } from '../../utils/cn';

export interface ComboboxOption {
  id: string;
  label: string;
}

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
}

export function Combobox({ value, onChange, options, placeholder, className }: ComboboxProps) {
  const selectedLabel = useMemo(() => options.find((o) => o.id === value)?.label ?? '', [value, options]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // When the dropdown is closed the input shows the committed selection label.
  // When open, it shows the live typed query so the user can filter.
  const inputValue = open ? query : selectedLabel;

  const filtered = open && query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && filtered[activeIndex]) {
      const opt = filtered[activeIndex];
      onChange(opt.id);
      setQuery('');
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <input
        className="input"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 && filtered[activeIndex] ? `${listboxId}-opt-${filtered[activeIndex].id}` : undefined}
      />
      {open && filtered.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-full mt-1 left-0 right-0 bg-surface border border-border rounded-md shadow-popover p-1.5 z-10 max-h-55 overflow-y-auto"
        >
          {filtered.map((opt, i) => (
            <div
              key={opt.id}
              id={`${listboxId}-opt-${opt.id}`}
              role="option"
              aria-selected={i === activeIndex}
              className={cn(
                'px-2.5 py-2 rounded text-ui cursor-pointer',
                i === activeIndex ? 'bg-surface-2 text-ink' : 'text-muted',
              )}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.id);
                setQuery('');
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
