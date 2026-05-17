import { FieldKind, FieldGroup } from '../enums';
import { useEffect } from 'react';
import type { FieldPlugin } from '../types/registry';
import type { DateConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';

export const datePlugin: FieldPlugin<DateConfig> = {
  kind: FieldKind.DATE,
  displayName: 'Date',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
  group: FieldGroup.INPUT,

  createDefault: (id) => ({
    id,
    kind: FieldKind.DATE,
    label: 'Date',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    prefillToday: false,
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
      <Toggle on={config.prefillToday} onChange={(v) => onChange({ ...config, prefillToday: v })} label="Prefill today's date" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Min date</label>
          <Input type="date" value={config.minDate ?? ''} onChange={(e) => onChange({ ...config, minDate: e.target.value || undefined })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Max date</label>
          <Input type="date" value={config.maxDate ?? ''} onChange={(e) => onChange({ ...config, maxDate: e.target.value || undefined })} />
        </div>
      </div>
      {config.minDate && config.maxDate && config.minDate > config.maxDate && (
        <p className="text-danger text-caption">Min date must be before max date</p>
      )}
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    useEffect(() => {
      if (config.prefillToday && !value) {
        const today = new Date().toISOString().slice(0, 10);
        let clamped = today;
        if (config.minDate && clamped < config.minDate) clamped = config.minDate;
        if (config.maxDate && clamped > config.maxDate) clamped = config.maxDate;
        onChange(clamped);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <Input
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || null)}
        min={config.minDate}
        max={config.maxDate}
        disabled={disabled}
        error={error ?? undefined}
      />
    );
  },

  validate: (value, config, required) => {
    const str = typeof value === 'string' ? value : '';
    if (required && !str) return config.requiredMessage ?? 'This field is required';
    if (!str) return null;
    if (config.minDate && str < config.minDate) return config.validationMessage ?? `Date must be on or after ${config.minDate}`;
    if (config.maxDate && str > config.maxDate) return config.validationMessage ?? `Date must be on or before ${config.maxDate}`;
    if (config.disabledDaysOfWeek?.length) {
      const day = new Date(str + 'T00:00:00').getDay();
      if (config.disabledDaysOfWeek.includes(day)) return config.validationMessage ?? 'This day is not available';
    }
    return null;
  },

  formatForPrint: (value) => (typeof value === 'string' ? value : null),
};
