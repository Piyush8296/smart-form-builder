import { FieldKind, FieldGroup, SingleSelectVariant } from '../enums';
import { useEffect, useRef } from 'react';
import type { FieldPlugin } from '../types/registry';
import type { SingleSelectConfig } from '../types/fields';
import { OTHER_OPTION_ID } from '../types/fields';
import { Combobox } from '../components/ui/Combobox';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { generateId } from '../utils/id';

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseOtherValue(v: string): string {
  return v.startsWith(`${OTHER_OPTION_ID}:`) ? v.slice(OTHER_OPTION_ID.length + 1) : '';
}

export const singleSelectPlugin: FieldPlugin<SingleSelectConfig> = {
  kind: FieldKind.SINGLE_SELECT,
  displayName: 'Single select',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/></svg>',
  group: FieldGroup.SELECT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.SINGLE_SELECT,
    label: 'Single select',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    options: [
      { id: generateId(), label: 'Option 1' },
      { id: generateId(), label: 'Option 2' },
    ],
    variant: SingleSelectVariant.RADIO,
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
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Variant</label>
        <div className="grid grid-cols-2 gap-1.5">
          {([SingleSelectVariant.RADIO, SingleSelectVariant.DROPDOWN, SingleSelectVariant.TILES, SingleSelectVariant.COMBOBOX]).map((v) => (
            <Button key={v} variant={config.variant === v ? 'primary' : 'secondary'} size="sm" onClick={() => onChange({ ...config, variant: v })}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
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
      {(config.variant === SingleSelectVariant.RADIO || config.variant === SingleSelectVariant.TILES) && (
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Columns</label>
          <Select value={config.columns ?? 1} onChange={(e) => onChange({ ...config, columns: Number(e.target.value) as 1 | 2 | 3 })}>
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </Select>
        </div>
      )}
      <Toggle on={config.allowOther} onChange={(v) => onChange({ ...config, allowOther: v })} label='Allow "Other"' />
      <Toggle on={config.shuffleOptions} onChange={(v) => onChange({ ...config, shuffleOptions: v })} label="Shuffle options" sub='Fisher-Yates per session; "Other" pinned last' />
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const strValue = typeof value === 'string' ? value : '';
    const isOther = strValue.startsWith(`${OTHER_OPTION_ID}:`);
    const otherText = isOther ? parseOtherValue(strValue) : '';

    const displayOptions = config.shuffleOptions
      ? [...fisherYates(config.options), ...(config.allowOther ? [{ id: OTHER_OPTION_ID, label: 'Other' }] : [])]
      : [...config.options, ...(config.allowOther ? [{ id: OTHER_OPTION_ID, label: 'Other' }] : [])];

    const shuffledRef = useRef(displayOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { shuffledRef.current = displayOptions; }, []); // only shuffle on mount

    if (config.variant === SingleSelectVariant.DROPDOWN) {
      return (
        <Select value={isOther ? OTHER_OPTION_ID : strValue} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
          <option value="">Choose…</option>
          {config.options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          {config.allowOther && <option value={OTHER_OPTION_ID}>Other</option>}
        </Select>
      );
    }

    if (config.variant === SingleSelectVariant.COMBOBOX) {
      return (
        <Combobox
          value={isOther ? OTHER_OPTION_ID : strValue}
          onChange={onChange}
          options={[...config.options, ...(config.allowOther ? [{ id: OTHER_OPTION_ID, label: 'Other' }] : [])]}
          placeholder="Type to filter…"
        />
      );
    }

    const gridClass = config.columns === 2 ? 'grid grid-cols-2 gap-1.5' : config.columns === 3 ? 'grid grid-cols-3 gap-1.5' : 'flex flex-col gap-1.5';

    return (
      <div>
        <div className={gridClass}>
          {shuffledRef.current.map((opt) => {
            const selected = isOther ? opt.id === OTHER_OPTION_ID : strValue === opt.id;
            return (
              <label key={opt.id} className={`choice-row cursor-pointer${config.variant === SingleSelectVariant.TILES ? ' border border-border rounded-md px-3 py-2 hover:bg-surface-2' : ''} ${selected ? 'data-[selected=true]:bg-surface-2' : ''}`} data-selected={selected}>
                <input
                  type="radio"
                  className="sr-only"
                  checked={selected}
                  onChange={() => onChange(opt.id)}
                  disabled={disabled}
                />
                <span className={`shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? 'border-ink bg-ink' : 'border-border'}`}>
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-bg" />}
                </span>
                <span className="text-ui">{opt.label}</span>
              </label>
            );
          })}
        </div>
        {isOther && (
          <Input className="mt-2" value={otherText} onChange={(e) => onChange(`${OTHER_OPTION_ID}:${e.target.value}`)} placeholder="Please specify…" disabled={disabled} />
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str) return config.requiredMessage ?? 'This field is required';
    if (!str) return null;
    if (str.startsWith(`${OTHER_OPTION_ID}:`)) {
      const text = str.slice(OTHER_OPTION_ID.length + 1);
      if (!text.trim()) return config.validationMessage ?? 'Please specify your answer for "Other"';
    }
    return null;
  },

  formatForPrint: (value) => {
    if (typeof value !== 'string') return null;
    if (value.startsWith(`${OTHER_OPTION_ID}:`)) return value.slice(OTHER_OPTION_ID.length + 1);
    return value;
  },
};
