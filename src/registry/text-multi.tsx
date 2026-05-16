import type { FieldPlugin } from '../types/registry';
import type { TextMultiConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

export const textMultiPlugin: FieldPlugin<TextMultiConfig> = {
  kind: 'text-multi',
  displayName: 'Paragraph',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'text-multi',
    label: 'Paragraph',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    rows: 4,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Description</label>
        <Input value={config.description ?? ''} onChange={(e) => onChange({ ...config, description: e.target.value || undefined })} placeholder="Optional helper text" />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Rows</label>
        <Input type="number" min={2} max={20} value={config.rows ?? 4} onChange={(e) => onChange({ ...config, rows: Number(e.target.value) })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min length</label>
          <Input type="number" value={config.minLength ?? ''} onChange={(e) => onChange({ ...config, minLength: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max length</label>
          <Input type="number" value={config.maxLength ?? ''} onChange={(e) => onChange({ ...config, maxLength: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Placeholder</label>
        <Input value={config.placeholder ?? ''} onChange={(e) => onChange({ ...config, placeholder: e.target.value || undefined })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Validation regex</label>
        <Input value={config.validationPattern ?? ''} onChange={(e) => onChange({ ...config, validationPattern: e.target.value || undefined })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Validation message</label>
        <Input value={config.validationMessage ?? ''} onChange={(e) => onChange({ ...config, validationMessage: e.target.value || undefined })} />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <textarea
      className={`input h-auto resize-y${error ? ' border-danger hover:border-danger focus:border-danger' : ''}`}
      rows={config.rows ?? 4}
      value={typeof value === 'string' ? value : (config.defaultValue ?? '')}
      placeholder={config.placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  ),

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str.trim()) return config.requiredMessage ?? 'This field is required';
    if (!str) return null;
    if (config.minLength && str.length < config.minLength) return config.validationMessage ?? `Must be at least ${config.minLength} characters`;
    if (config.maxLength && str.length > config.maxLength) return config.validationMessage ?? `Must be at most ${config.maxLength} characters`;
    if (config.validationPattern) {
      try {
        if (!new RegExp(config.validationPattern).test(str)) return config.validationMessage ?? 'Invalid format';
      } catch {
        console.warn(`[text-multi] invalid regex: ${config.validationPattern}`);
      }
    }
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
