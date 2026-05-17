import { useMemo, useCallback } from 'react';
import { useBuildContext } from '../contexts/BuilderContext';
import type { FieldConfig, FieldKind } from '../types/fields';
import { getPlugin } from '../registry';
import { generateId } from '../utils/id';
import { BuilderActionType } from '../enums';

export function useBuilder() {
  const { state, dispatch } = useBuildContext();
  const { template, selectedFieldId, hasUnsavedChanges } = state;

  const selectedField = useMemo(
    () => selectedFieldId ? template.fields.find((f) => f.id === selectedFieldId) ?? null : null,
    [selectedFieldId, template.fields],
  );

  const addField = useCallback((kind: FieldKind) => {
    const id = generateId();
    const plugin = getPlugin(kind);
    const field = plugin.createDefault(id);
    dispatch({ type: BuilderActionType.ADD_FIELD, payload: field });
  }, [dispatch]);

  const removeField = useCallback((id: string) => {
    dispatch({ type: BuilderActionType.REMOVE_FIELD, payload: id });
  }, [dispatch]);

  const updateField = useCallback((field: FieldConfig) => {
    dispatch({ type: BuilderActionType.UPDATE_FIELD, payload: field });
  }, [dispatch]);

  const moveField = useCallback((from: number, to: number) => {
    dispatch({ type: BuilderActionType.MOVE_FIELD, payload: { from, to } });
  }, [dispatch]);

  const selectField = useCallback((id: string | null) => {
    dispatch({ type: BuilderActionType.SELECT_FIELD, payload: id });
  }, [dispatch]);

  const duplicateField = useCallback((id: string) => {
    dispatch({ type: BuilderActionType.DUPLICATE_FIELD, payload: id });
  }, [dispatch]);

  return {
    template,
    fields: template.fields,
    selectedFieldId,
    selectedField,
    hasUnsavedChanges,
    dispatch,
    addField,
    removeField,
    updateField,
    moveField,
    selectField,
    duplicateField,
  };
}
