import { useState } from 'react';
import type { FieldPlugin } from '../types/registry';
import type { RatingConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export const ratingPlugin: FieldPlugin<RatingConfig> = {
  kind: 'rating',
  displayName: 'Rating',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.6 8.6l7 .6-5.3 4.6 1.6 6.8L12 16.9 6.1 20.6l1.6-6.8L2.4 9.2l7-.6z"/></svg>',
  group: 'input',

  createDefault: (id) => ({
    id,
    kind: 'rating',
    label: 'Rating',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    maxRating: 5,
  }),

  ConfigEditor: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
        <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
      </div>
      <div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Max rating</label>
        <Select value={config.maxRating} onChange={(e) => onChange({ ...config, maxRating: Number(e.target.value) as 5 | 10 })}>
          <option value={5}>5 stars</option><option value={10}>10 stars</option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Low label</label>
          <Input value={config.lowLabel ?? ''} onChange={(e) => onChange({ ...config, lowLabel: e.target.value || undefined })} placeholder="Terrible" />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">High label</label>
          <Input value={config.highLabel ?? ''} onChange={(e) => onChange({ ...config, highLabel: e.target.value || undefined })} placeholder="Excellent" />
        </div>
      </div>
    </div>
  ),

  FieldRenderer: ({ config, value, onChange, error, disabled }) => {
    const [hovered, setHovered] = useState<number | null>(null);
    const selected = typeof value === 'number' ? value : 0;

    return (
      <div>
        <div className="flex gap-1" onMouseLeave={() => setHovered(null)}>
          {Array.from({ length: config.maxRating }, (_, i) => i + 1).map((n) => {
            const filled = n <= (hovered ?? selected);
            return (
              <button
                key={n}
                type="button"
                className={`text-xl transition-colors ${filled ? 'text-yellow-400' : 'text-border'}`}
                onMouseEnter={() => !disabled && setHovered(n)}
                onClick={() => !disabled && onChange(selected === n ? null : n)}
                disabled={disabled}
                aria-label={`${n} star${n !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            );
          })}
        </div>
        {(config.lowLabel || config.highLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-caption text-muted">{config.lowLabel}</span>
            <span className="text-caption text-muted">{config.highLabel}</span>
          </div>
        )}
        {error && <p className="text-danger text-caption mt-1">{error}</p>}
      </div>
    );
  },

  validate: (value, config, required) => {
    if (required && (value === null || value === 0)) return config.requiredMessage ?? 'This field is required';
    return null;
  },

  formatForPrint: (value, config) => {
    if (typeof value !== 'number') return null;
    return `${value} / ${config.maxRating} stars`;
  },
};
