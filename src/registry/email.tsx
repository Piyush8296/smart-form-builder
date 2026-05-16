import type { FieldPlugin } from '../types/registry';
import type { EmailConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailPlugin: FieldPlugin<EmailConfig> = {
  kind: 'email',
  displayName: 'Email',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'email',
    label: 'Email',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    placeholder: 'name@example.com',
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
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Placeholder</label>
        <Input value={config.placeholder ?? ''} onChange={(e) => onChange({ ...config, placeholder: e.target.value || undefined })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Validation message</label>
        <Input value={config.validationMessage ?? ''} onChange={(e) => onChange({ ...config, validationMessage: e.target.value || undefined })} placeholder="Please enter a valid email address" />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <Input
      type="email"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={config.placeholder}
      disabled={disabled}
      error={error ?? undefined}
    />
  ),

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str.trim()) return config.requiredMessage ?? 'This field is required';
    if (!str) return null;
    if (!EMAIL_RE.test(str)) return config.validationMessage ?? 'Please enter a valid email address';
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
