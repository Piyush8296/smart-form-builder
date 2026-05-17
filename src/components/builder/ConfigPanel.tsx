import { memo, useState } from 'react';
import { Toggle } from '../ui/Toggle';
import { ConditionEditor } from './ConditionEditor';
import { getPlugin } from '../../registry';
import type { FieldConfig } from '../../types/fields';
import { BuilderTab } from '../../enums';

interface ConfigPanelProps {
  field: FieldConfig;
  allFields: FieldConfig[];
  onChange: (field: FieldConfig) => void;
}

export const ConfigPanel = memo(function ConfigPanel({ field, allFields, onChange }: ConfigPanelProps) {
  const [tab, setTab] = useState<BuilderTab>(BuilderTab.FIELD);
  const plugin = getPlugin(field.kind);

  return (
    <>
      <div className="sticky top-0 bg-surface border-b border-divider z-lifted">
        <div className="flex border-b border-divider px-3 gap-1">
          {Object.values(BuilderTab).map((t) => (
            <button
              key={t}
              className="px-2 py-2.5 text-caption text-muted border-b-2 border-transparent -mb-px cursor-pointer hover:text-ink data-[active=true]:text-ink data-[active=true]:border-ink data-[active=true]:font-medium"
              data-active={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 overflow-y-auto">
        {tab === BuilderTab.FIELD && (
          <>
            <div className="text-label font-semibold uppercase tracking-wider text-muted mb-3">
              {plugin.displayName} · {field.label || '(no label)'}
            </div>
            <plugin.ConfigEditor
              config={field as never}
              allFields={allFields}
              onChange={(updated) => onChange(updated as FieldConfig)}
            />
          </>
        )}

        {tab === BuilderTab.LOGIC && (
          <>
            <div className="text-label font-semibold uppercase tracking-wider text-muted mb-3">Conditions</div>
            <ConditionEditor
              conditions={field.conditions}
              allFields={allFields}
              currentFieldId={field.id}
              onChange={(conditions) => onChange({ ...field, conditions })}
            />
          </>
        )}

        {tab === BuilderTab.VALIDATION && (
          <>
            <div className="text-label font-semibold uppercase tracking-wider text-muted mb-3">Behavior</div>
            <Toggle
              on={field.defaultRequired}
              onChange={(v) => onChange({ ...field, defaultRequired: v })}
              label="Required"
              sub="Respondent must fill this before submitting."
            />
            <Toggle
              on={field.defaultVisible}
              onChange={(v) => onChange({ ...field, defaultVisible: v })}
              label="Visible by default"
              sub="Can be overridden by conditions."
            />
          </>
        )}
      </div>
    </>
  );
});
