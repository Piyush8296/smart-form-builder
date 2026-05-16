import type { FieldPlugin } from '../types/registry';
import type { AddressConfig, AddressValue, FieldValue } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';

function isAddressValue(v: FieldValue): v is AddressValue {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'street1' in v;
}

function emptyAddress(): AddressValue {
  return { street1: '', city: '', country: '' };
}

export const addressPlugin: FieldPlugin<AddressConfig> = {
  kind: 'address',
  displayName: 'Address',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'address',
    label: 'Address',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    includeStreet2: true,
    includeState: true,
    includeZip: true,
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
      <Toggle on={config.includeStreet2} onChange={(v) => onChange({ ...config, includeStreet2: v })} label="Include address line 2" />
      <Toggle on={config.includeState} onChange={(v) => onChange({ ...config, includeState: v })} label="Include state / province" />
      <Toggle on={config.includeZip} onChange={(v) => onChange({ ...config, includeZip: v })} label="Include ZIP / postal code" />
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Fixed country (leave blank to show dropdown)</label>
        <Input value={config.countryFixed ?? ''} onChange={(e) => onChange({ ...config, countryFixed: e.target.value || undefined })} placeholder="e.g. United States" />
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const addr = isAddressValue(value) ? value : emptyAddress();
    function update(patch: Partial<AddressValue>) { onChange({ ...addr, ...patch }); }
    return (
      <div className="space-y-2">
        <Input value={addr.street1} onChange={(e) => update({ street1: e.target.value })} placeholder="Street address" disabled={disabled} error={error && !addr.street1 ? error : undefined} />
        {config.includeStreet2 && (
          <Input value={addr.street2 ?? ''} onChange={(e) => update({ street2: e.target.value || undefined })} placeholder="Apt, suite, floor (optional)" disabled={disabled} />
        )}
        <div className="grid grid-cols-2 gap-2">
          <Input value={addr.city} onChange={(e) => update({ city: e.target.value })} placeholder="City" disabled={disabled} />
          {config.includeState && (
            <Input value={addr.state ?? ''} onChange={(e) => update({ state: e.target.value || undefined })} placeholder="State / Province" disabled={disabled} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {config.includeZip && (
            <Input value={addr.zip ?? ''} onChange={(e) => update({ zip: e.target.value || undefined })} placeholder="ZIP / Postal code" disabled={disabled} />
          )}
          {config.countryFixed ? (
            <Input value={config.countryFixed} disabled />
          ) : (
            <Input value={addr.country} onChange={(e) => update({ country: e.target.value })} placeholder="Country" disabled={disabled} />
          )}
        </div>
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    if (!isAddressValue(value)) {
      if (required) return config.requiredMessage ?? 'This field is required';
      return null;
    }
    if (required && (!value.street1.trim() || !value.city.trim() || (!config.countryFixed && !value.country.trim()))) {
      return config.validationMessage ?? 'Please complete all required address fields';
    }
    return null;
  },

  formatForPrint: (value) => {
    if (!isAddressValue(value)) return null;
    const lines = [
      value.street1,
      value.street2,
      [value.city, value.state].filter(Boolean).join(', '),
      [value.zip, value.country].filter(Boolean).join(' '),
    ].filter(Boolean);
    return lines.join('\n');
  },
};
