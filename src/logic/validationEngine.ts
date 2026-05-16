import type { FieldConfig, FieldValue } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';
import { getPlugin } from '../registry';

export function validateAll(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): Map<string, string> {
  const errors = new Map<string, string>();

  for (const field of fields) {
    const state = visibilityMap.get(field.id);
    if (!state?.visible) continue;

    const plugin = getPlugin(field.kind);
    if (plugin.isDisplayOnly || plugin.isComputed) continue;

    const value = answers.get(field.id) ?? null;
    const error = plugin.validate(value, field as never, state.required);
    if (error) errors.set(field.id, error);
  }

  return errors;
}
