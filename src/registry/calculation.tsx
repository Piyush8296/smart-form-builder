import { FieldKind, FieldGroup, CalculationOperation } from '../enums';
import type { FieldPlugin } from '../types/registry';
import type { CalculationConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { CALCULATION_OPERATIONS } from '../constants/calculationOperations';

export const calculationPlugin: FieldPlugin<CalculationConfig> = {
  kind: FieldKind.CALCULATION,
  displayName: 'Calculation',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>',
  group: FieldGroup.SPECIAL,
  isComputed: true,

  createDefault: (id) => ({
    id,
    kind: FieldKind.CALCULATION,
    label: 'Calculation',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
  }),

  ConfigEditor: ({ config, allFields, onChange }) => {
    const numericFields = allFields.filter((f) =>
      f.kind === FieldKind.NUMBER || f.kind === FieldKind.CALCULATION || f.kind === FieldKind.RATING || f.kind === FieldKind.LINEAR_SCALE
    );
    return (
      <div className="space-y-3">
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Label</label>
          <Input value={config.label} onChange={(e) => onChange({ ...config, label: e.target.value })} />
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Operation</label>
          <Select value={config.operation} onChange={(e) => onChange({ ...config, operation: e.target.value as CalculationOperation })}>
            {CALCULATION_OPERATIONS.map((op) => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Source fields</label>
          {numericFields.map((f) => (
            <label key={f.id} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={config.sourceFieldIds.includes(f.id)}
                onChange={(e) => onChange({
                  ...config,
                  sourceFieldIds: e.target.checked
                    ? [...config.sourceFieldIds, f.id]
                    : config.sourceFieldIds.filter((id) => id !== f.id),
                })}
              />
              <span className="text-ui">{f.label}</span>
            </label>
          ))}
          {numericFields.length === 0 && <p className="text-caption text-muted">Add number fields first</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-caption font-medium text-ink-2 mb-1.5">Prefix</label>
            <Input value={config.prefix ?? ''} onChange={(e) => onChange({ ...config, prefix: e.target.value || undefined })} placeholder="$" />
          </div>
          <div>
            <label className="block text-caption font-medium text-ink-2 mb-1.5">Suffix</label>
            <Input value={config.suffix ?? ''} onChange={(e) => onChange({ ...config, suffix: e.target.value || undefined })} />
          </div>
        </div>
        <div>
          <label className="block text-caption font-medium text-ink-2 mb-1.5">Decimal places</label>
          <Input type="number" min={0} max={10} value={config.decimalPlaces ?? ''} onChange={(e) => onChange({ ...config, decimalPlaces: e.target.value !== '' ? Number(e.target.value) : undefined })} />
        </div>
      </div>
    );
  },

  FieldRenderer: ({ config, value }) => {
    const display = value !== null && value !== undefined ? Number(value) : null;
    if (display === null) {
      return <div className="text-muted text-ui">—</div>;
    }
    const str = config.decimalPlaces !== undefined ? display.toFixed(config.decimalPlaces) : String(display);
    return (
      <div className="text-ui font-medium text-ink">
        {config.prefix ?? ''}{str}{config.suffix ?? ''}
      </div>
    );
  },

  validate: () => null,

  formatForPrint: (value, config) => {
    if (value === null || value === undefined) return '—';
    const n = Number(value);
    if (isNaN(n)) return '—';
    const str = config.decimalPlaces !== undefined ? n.toFixed(config.decimalPlaces) : String(n);
    return `${config.prefix ?? ''}${str}${config.suffix ?? ''}`;
  },
};
