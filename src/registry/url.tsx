import { FieldKind, FieldGroup } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { UrlConfig } from '../types/fields';
import { Input } from '../components/ui/Input';

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export const urlPlugin: FieldPlugin<UrlConfig> = {
  kind: FieldKind.URL,
  displayName: 'Website URL',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  group: FieldGroup.INPUT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.URL,
    label: 'Website URL',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    placeholder: 'https://example.com',
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
        <Input value={config.validationMessage ?? ''} onChange={(e) => onChange({ ...config, validationMessage: e.target.value || undefined })} placeholder="Please enter a valid URL" />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => (
    <Input
      type="url"
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
    if (!isValidUrl(str)) return config.validationMessage ?? 'Please enter a valid URL';
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
