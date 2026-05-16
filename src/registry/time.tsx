import type { FieldPlugin } from '../types/registry';
import type { TimeConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

export const timePlugin: FieldPlugin<TimeConfig> = {
  kind: 'time',
  displayName: 'Time',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'time',
    label: 'Time',
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
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min time</label>
          <Input type="time" value={config.minTime ?? ''} onChange={(e) => onChange({ ...config, minTime: e.target.value || undefined })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max time</label>
          <Input type="time" value={config.maxTime ?? ''} onChange={(e) => onChange({ ...config, maxTime: e.target.value || undefined })} />
        </div>
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <Input
      type="time"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value || null)}
      min={config.minTime}
      max={config.maxTime}
      disabled={disabled}
      error={error ?? undefined}
    />
  ),

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str) return config.requiredMessage ?? 'This field is required';
    if (!str) return null;
    if (config.minTime && str < config.minTime) return config.validationMessage ?? `Time must be at or after ${config.minTime}`;
    if (config.maxTime && str > config.maxTime) return config.validationMessage ?? `Time must be at or before ${config.maxTime}`;
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
