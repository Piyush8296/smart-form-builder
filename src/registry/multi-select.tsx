import { useState, useRef, useEffect, useMemo } from 'react';
import { FieldKind, FieldGroup } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { MultiSelectConfig } from '../types/fields';
import { OTHER_OPTION_ID } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { generateId } from '../utils/id';
import { useDebounce } from '../hooks/useDebounce';

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getOtherText(values: string[]): string {
  const v = values.find((s) => s.startsWith(`${OTHER_OPTION_ID}:`));
  return v ? v.slice(OTHER_OPTION_ID.length + 1) : '';
}

export const multiSelectPlugin: FieldPlugin<MultiSelectConfig> = {
  kind: FieldKind.MULTI_SELECT,
  displayName: 'Multi select',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>',
  group: FieldGroup.SELECT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.MULTI_SELECT,
    label: 'Multi select',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    options: [
      { id: generateId(), label: 'Option 1' },
      { id: generateId(), label: 'Option 2' },
    ],
    minSelections: null,
    maxSelections: null,
    searchable: false,
    allowOther: false,
    shuffleOptions: false,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Description</label>
        <Input value={config.description ?? ''} onChange={(e) => onChange({ ...config, description: e.target.value || undefined })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Options</label>
        {config.options.map((opt) => (
          <div key={opt.id} className="flex items-center gap-2 mb-1.5">
            <Input value={opt.label} onChange={(e) => onChange({ ...config, options: config.options.map((o) => o.id === opt.id ? { ...o, label: e.target.value } : o) })} />
            <Button variant="danger-ghost" size="sm" icon onClick={() => onChange({ ...config, options: config.options.filter((o) => o.id !== opt.id) })}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </Button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...config, options: [...config.options, { id: generateId(), label: `Option ${config.options.length + 1}` }] })}>
          + Add option
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min selections</label>
          <Input type="number" min={0} value={config.minSelections ?? ''} onChange={(e) => onChange({ ...config, minSelections: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max selections</label>
          <Input type="number" min={1} value={config.maxSelections ?? ''} onChange={(e) => onChange({ ...config, maxSelections: e.target.value ? Number(e.target.value) : null })} />
        </div>
      </div>
      <Toggle on={config.searchable} onChange={(v) => onChange({ ...config, searchable: v })} label="Searchable" />
      <Toggle on={config.allowOther} onChange={(v) => onChange({ ...config, allowOther: v })} label='Allow "Other"' />
      <Toggle on={config.shuffleOptions} onChange={(v) => onChange({ ...config, shuffleOptions: v })} label="Shuffle options" />
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const selected: string[] = Array.isArray(value) ? value : [];
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const shuffledRef = useRef(config.shuffleOptions ? fisherYates(config.options) : config.options);
    useEffect(() => { shuffledRef.current = config.shuffleOptions ? fisherYates(config.options) : config.options; }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const displayOptions = useMemo(
      () => [
        ...shuffledRef.current,
        ...(config.allowOther ? [{ id: OTHER_OPTION_ID, label: 'Other' }] : []),
      ],
      [config.allowOther],
    );

    const filtered = useMemo(
      () => debouncedQuery
        ? displayOptions.filter((o) => o.label.toLowerCase().includes(debouncedQuery.toLowerCase()))
        : displayOptions,
      [debouncedQuery, displayOptions],
    );

    function toggle(id: string) {
      if (selected.includes(id) || selected.some((s) => s.startsWith(`${id}:`))) {
        onChange(selected.filter((s) => s !== id && !s.startsWith(`${id}:`)));
      } else {
        if (config.maxSelections && selected.length >= config.maxSelections) return;
        onChange([...selected, id]);
      }
    }

    const otherText = getOtherText(selected);
    const hasOther = selected.some((s) => s.startsWith(`${OTHER_OPTION_ID}:`)) || selected.includes(OTHER_OPTION_ID);
    const gridClass = config.columns === 2 ? 'grid grid-cols-2 gap-1.5' : config.columns === 3 ? 'grid grid-cols-3 gap-1.5' : 'flex flex-col gap-1.5';

    return (
      <div>
        {config.searchable && (
          <Input className="mb-2" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search options…" />
        )}
        <div className={gridClass}>
          {filtered.map((opt) => {
            const checked = opt.id === OTHER_OPTION_ID ? hasOther : selected.includes(opt.id);
            return (
              <label key={opt.id} className="choice-row cursor-pointer" data-selected={checked}>
                <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(opt.id)} disabled={disabled} />
                <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${checked ? 'border-ink bg-ink' : 'border-border'}`}>
                  {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m5 12 5 5 9-10"/></svg>}
                </span>
                <span className="text-ui">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {hasOther && (
          <Input className="mt-2" value={otherText} onChange={(e) => {
            const without = selected.filter((s) => s !== OTHER_OPTION_ID && !s.startsWith(`${OTHER_OPTION_ID}:`));
            onChange([...without, `${OTHER_OPTION_ID}:${e.target.value}`]);
          }} placeholder="Please specify…" disabled={disabled} />
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    const selected: string[] = Array.isArray(value) ? value : [];
    const realCount = selected.filter((s) => s !== OTHER_OPTION_ID).length;
    if (required && realCount === 0) return config.requiredMessage ?? 'This field is required';
    if (config.minSelections && realCount < config.minSelections) return config.validationMessage ?? `Select at least ${config.minSelections} options`;
    if (config.maxSelections && realCount > config.maxSelections) return config.validationMessage ?? `Select at most ${config.maxSelections} options`;
    const otherEntry = selected.find((s) => s.startsWith(`${OTHER_OPTION_ID}:`));
    if (otherEntry && !otherEntry.slice(OTHER_OPTION_ID.length + 1).trim()) return config.validationMessage ?? 'Please specify your answer for "Other"';
    return null;
  },

  formatForPrint: (value) => {
    if (!Array.isArray(value)) return null;
    return value.map((s) => s.startsWith(`${OTHER_OPTION_ID}:`) ? s.slice(OTHER_OPTION_ID.length + 1) : s).join(', ');
  },
};
