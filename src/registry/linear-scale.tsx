import type { FieldPlugin } from '../types/registry';
import type { LinearScaleConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export const linearScalePlugin: FieldPlugin<LinearScaleConfig> = {
  kind: 'linear-scale',
  displayName: 'Linear scale',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M6 9v6M10 9v6M14 9v6M18 9v6"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'linear-scale',
    label: 'Linear scale',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    minValue: 1,
    maxValue: 5,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min value</label>
          <Select value={config.minValue} onChange={(e) => onChange({ ...config, minValue: Number(e.target.value) as 0 | 1 })}>
            <option value={0}>0</option><option value={1}>1</option>
          </Select>
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max value</label>
          <Select value={config.maxValue} onChange={(e) => onChange({ ...config, maxValue: Number(e.target.value) as LinearScaleConfig['maxValue'] })}>
            {[2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min label</label>
          <Input value={config.minLabel ?? ''} onChange={(e) => onChange({ ...config, minLabel: e.target.value || undefined })} placeholder="Strongly disagree" />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max label</label>
          <Input value={config.maxLabel ?? ''} onChange={(e) => onChange({ ...config, maxLabel: e.target.value || undefined })} placeholder="Strongly agree" />
        </div>
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const selected = typeof value === 'number' ? value : null;
    const points = Array.from({ length: config.maxValue - config.minValue + 1 }, (_, i) => config.minValue + i);

    return (
      <div>
        <div className="scale-row flex gap-1.5 flex-wrap">
          {points.map((n) => (
            <button
              key={n}
              type="button"
              className={`scale-btn w-9 h-9 rounded border text-ui font-medium transition-colors ${selected === n ? 'bg-ink text-bg border-ink' : 'border-border hover:border-ink hover:bg-surface-2'}`}
              onClick={() => !disabled && onChange(selected === n ? null : n)}
              disabled={disabled}
              aria-pressed={selected === n}
            >
              {n}
            </button>
          ))}
        </div>
        {(config.minLabel || config.maxLabel) && (
          <div className="scale-endpoints flex justify-between mt-1.5">
            <span className="text-caption text-muted">{config.minLabel}</span>
            <span className="text-caption text-muted">{config.maxLabel}</span>
          </div>
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    if (required && value === null) return config.requiredMessage ?? 'This field is required';
    return null;
  },

  formatForPrint: (value, config) => {
    if (typeof value !== 'number') return null;
    return `${value} (${config.minValue}–${config.maxValue})`;
  },
};
