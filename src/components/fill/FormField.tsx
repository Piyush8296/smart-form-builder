import { getPlugin } from '../../registry';
import type { FieldConfig, FieldValue } from '../../types/fields';
import type { FieldVisibilityState } from '../../types/conditions';

interface FormFieldProps {
  field: FieldConfig;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error: string | null;
  visibilityState: FieldVisibilityState;
  disabled?: boolean;
}

export function FormField({ field, value, onChange, error, visibilityState, disabled = false }: FormFieldProps) {
  const plugin = getPlugin(field.kind);

  return (
    <div
      id={`field-${field.id}`}
      className="bg-surface border rounded-lg px-7 py-card mb-3 max-mob:px-4 max-mob:py-section"
      style={{ borderColor: error ? 'var(--color-danger)' : undefined }}
      data-error={error ? 'true' : undefined}
    >
      {!plugin.isDisplayOnly && !plugin.isComputed && (
        <div className="text-question font-medium tracking-snug-xs mb-1">
          {field.label}
          {visibilityState.required && <span className="text-danger font-semibold ml-0.5">*</span>}
        </div>
      )}
      {field.description && (
        <div className="text-muted text-ui mb-3.5">{field.description}</div>
      )}
      <plugin.FieldRenderer
        config={field as never}
        value={value}
        onChange={onChange}
        error={error}
        disabled={disabled}
        visibilityState={visibilityState}
      />
    </div>
  );
}
