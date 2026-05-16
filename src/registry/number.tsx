import type { FieldPlugin } from '../types/registry';
import type { NumberConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

export const numberPlugin: FieldPlugin<NumberConfig> = {
  kind: 'number',
  displayName: 'Number',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'number',
    label: 'Number',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Prefix</label>
          <Input value={config.prefix ?? ''} onChange={(e) => onChange({ ...config, prefix: e.target.value || undefined })} placeholder="$" />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Suffix</label>
          <Input value={config.suffix ?? ''} onChange={(e) => onChange({ ...config, suffix: e.target.value || undefined })} placeholder="kg" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min</label>
          <Input type="number" value={config.min ?? ''} onChange={(e) => onChange({ ...config, min: e.target.value !== '' ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max</label>
          <Input type="number" value={config.max ?? ''} onChange={(e) => onChange({ ...config, max: e.target.value !== '' ? Number(e.target.value) : undefined })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Decimal places</label>
          <Input type="number" min={0} max={10} value={config.decimalPlaces ?? ''} onChange={(e) => onChange({ ...config, decimalPlaces: e.target.value !== '' ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Step</label>
          <Input type="number" min={0} value={config.step ?? ''} onChange={(e) => onChange({ ...config, step: e.target.value ? Number(e.target.value) : undefined })} placeholder="1" />
        </div>
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Placeholder</label>
        <Input value={config.placeholder ?? ''} onChange={(e) => onChange({ ...config, placeholder: e.target.value || undefined })} />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <Input
      type="number"
      value={value !== null && value !== undefined ? String(value) : (config.defaultValue !== undefined ? String(config.defaultValue) : '')}
      onChange={(e) => onChange(e.target.value !== '' ? Number(e.target.value) : null)}
      placeholder={config.placeholder}
      prefix={config.prefix}
      suffix={config.suffix}
      min={config.min}
      max={config.max}
      step={config.step ?? (config.decimalPlaces === 0 ? 1 : undefined)}
      disabled={disabled}
      error={error ?? undefined}
    />
  ),

  validate: (value, config, required) => {
    if (required && (value === null || value === '')) return config.requiredMessage ?? 'This field is required';
    if (value === null || value === '') return null;
    const n = Number(value);
    if (isNaN(n)) return config.validationMessage ?? 'Must be a valid number';
    if (config.min !== undefined && n < config.min) return config.validationMessage ?? `Must be at least ${config.min}`;
    if (config.max !== undefined && n > config.max) return config.validationMessage ?? `Must be at most ${config.max}`;
    if (config.decimalPlaces === 0 && !Number.isInteger(n)) return config.validationMessage ?? 'Must be a whole number';
    return null;
  },

  formatForPrint: (value, config) => {
    if (value === null) return null;
    const n = Number(value);
    if (isNaN(n)) return null;
    const str = config.decimalPlaces !== undefined ? n.toFixed(config.decimalPlaces) : String(n);
    return `${config.prefix ?? ''}${str}${config.suffix ?? ''}`;
  },
};
