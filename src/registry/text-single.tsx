import { FieldKind, FieldGroup } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { TextSingleConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

export const textSinglePlugin: FieldPlugin<TextSingleConfig> = {
  kind: FieldKind.TEXT_SINGLE,
  displayName: 'Short text',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V5h16v2"/><path d="M12 5v14"/><path d="M9 19h6"/></svg>',
  group: FieldGroup.INPUT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.TEXT_SINGLE,
    label: 'Short text',
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
        <Input value={config.description ?? ''} onChange={(e) => onChange({ ...config, description: e.target.value || undefined })} placeholder="Optional helper text" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Prefix</label>
          <Input value={config.prefix ?? ''} onChange={(e) => onChange({ ...config, prefix: e.target.value || undefined })} placeholder="e.g. $" />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Suffix</label>
          <Input value={config.suffix ?? ''} onChange={(e) => onChange({ ...config, suffix: e.target.value || undefined })} placeholder="e.g. kg" />
        </div>
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
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Default value</label>
        <Input value={config.defaultValue ?? ''} onChange={(e) => onChange({ ...config, defaultValue: e.target.value || undefined })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Validation regex</label>
        <Input value={config.validationPattern ?? ''} onChange={(e) => onChange({ ...config, validationPattern: e.target.value || undefined })} placeholder="^[A-Z]{3}$" />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Validation message</label>
        <Input value={config.validationMessage ?? ''} onChange={(e) => onChange({ ...config, validationMessage: e.target.value || undefined })} placeholder="Invalid format" />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <div>
      <Input
        type="text"
        value={typeof value === 'string' ? value : (config.defaultValue ?? '')}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        prefix={config.prefix}
        suffix={config.suffix}
        disabled={disabled}
        error={error ?? undefined}
      />
    </div>
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
        console.warn(`[text-single] invalid regex: ${config.validationPattern}`);
      }
    }
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
