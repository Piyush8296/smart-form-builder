import { useBuildContext } from '../contexts/BuilderContext';
import type { FieldConfig } from '../types/fields';
import type { FieldKind } from '../types/fields';
import { getPlugin } from '../registry';
import { generateId } from '../utils/id';

export function useBuilder() {
  const { state, dispatch } = useBuildContext();
  const { template, selectedFieldId, isDirty } = state;

  const selectedField = selectedFieldId
    ? template.fields.find((f) => f.id === selectedFieldId) ?? null
    : null;

  function addField(kind: FieldKind) {
    const id = generateId();
    const plugin = getPlugin(kind);
    const field = plugin.createDefault(id);
    dispatch({ type: 'ADD_FIELD', payload: field });
  }

  function removeField(id: string) {
    dispatch({ type: 'REMOVE_FIELD', payload: id });
  }

  function updateField(field: FieldConfig) {
    dispatch({ type: 'UPDATE_FIELD', payload: field });
  }

  function moveField(from: number, to: number) {
    dispatch({ type: 'MOVE_FIELD', payload: { from, to } });
  }

  function selectField(id: string | null) {
    dispatch({ type: 'SELECT_FIELD', payload: id });
  }

  function duplicateField(id: string) {
    dispatch({ type: 'DUPLICATE_FIELD', payload: id });
  }

  return {
    template,
    fields: template.fields,
    selectedFieldId,
    selectedField,
    isDirty,
    dispatch,
    addField,
    removeField,
    updateField,
    moveField,
    selectField,
    duplicateField,
  };
}
