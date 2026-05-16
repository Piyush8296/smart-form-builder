import type { FieldPlugin } from '../types/registry';
import type { SectionHeaderConfig } from '../types/fields';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Toggle } from '../components/ui/Toggle';

const SIZE_CLASS: Record<SectionHeaderConfig['size'], string> = {
  xs: 'text-xs font-semibold',
  sm: 'text-sm font-semibold',
  md: 'text-base font-semibold',
  lg: 'text-lg font-semibold',
  xl: 'text-xl font-semibold',
};

export const sectionHeaderPlugin: FieldPlugin<SectionHeaderConfig> = {
  kind: 'section-header',
  displayName: 'Section header',
  icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16M18 4v16M6 12h12"/></svg>',
  group: 'display',
  isDisplayOnly: true,

  createDefault: (id) => ({
    id,
    kind: 'section-header',
    label: 'Section',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    size: 'md',
    showDivider: false,
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
        <label className="block text-caption font-medium text-ink-2 mb-1.5">Size</label>
        <Select value={config.size} onChange={(e) => onChange({ ...config, size: e.target.value as SectionHeaderConfig['size'] })}>
          <option value="xs">XS</option><option value="sm">SM</option><option value="md">MD</option><option value="lg">LG</option><option value="xl">XL</option>
        </Select>
      </div>
      <Toggle on={config.showDivider ?? false} onChange={(v) => onChange({ ...config, showDivider: v })} label="Show divider above" />
    </div>
  ),

  FieldRenderer: ({ config }) => (
    <div>
      {config.showDivider && <hr className="border-divider mb-4" />}
      <div className={SIZE_CLASS[config.size]}>{config.label}</div>
      {config.description && <p className="text-muted text-ui mt-1">{config.description}</p>}
    </div>
  ),

  validate: () => null,
  formatForPrint: () => null,
};
