import { useMemo, useCallback } from 'react';
import { useFillContext } from '../contexts/FillContext';
import type { FieldValue } from '../types/fields';
import { getPlugin } from '../registry';
import { FillActionType } from '../enums';

export function useFill() {
  const { state, dispatch, submit } = useFillContext();
  const { template, answers, visibilityMap, errors, submitted, submitError } = state;

  const visibleFields = useMemo(
    () => template.fields.filter((f) => visibilityMap.get(f.id)?.visible ?? true),
    [template.fields, visibilityMap],
  );

  const interactiveFieldCount = useMemo(
    () => visibleFields.filter((f) => {
      const p = getPlugin(f.kind);
      return !p.isDisplayOnly && !p.isComputed;
    }).length,
    [visibleFields],
  );

  const completedCount = useMemo(
    () => visibleFields.filter((f) => {
      const plugin = getPlugin(f.kind);
      if (plugin.isDisplayOnly || plugin.isComputed) return false;
      const val = answers.get(f.id);
      return val !== null && val !== undefined && val !== '';
    }).length,
    [visibleFields, answers],
  );

  const requiredTotal = useMemo(
    () => visibleFields.filter((f) => visibilityMap.get(f.id)?.required ?? false).length,
    [visibleFields, visibilityMap],
  );

  const setAnswer = useCallback((fieldId: string, value: FieldValue) => {
    dispatch({ type: FillActionType.SET_ANSWER, payload: { fieldId, value } });
  }, [dispatch]);

  const getAnswer = useCallback((fieldId: string): FieldValue => {
    return answers.get(fieldId) ?? null;
  }, [answers]);

  const isVisible = useCallback((fieldId: string): boolean => {
    return visibilityMap.get(fieldId)?.visible ?? true;
  }, [visibilityMap]);

  const isRequired = useCallback((fieldId: string): boolean => {
    return visibilityMap.get(fieldId)?.required ?? false;
  }, [visibilityMap]);

  const getError = useCallback((fieldId: string): string | null => {
    return errors.get(fieldId) ?? null;
  }, [errors]);

  const loadDraft = useCallback((draftAnswers: Map<string, FieldValue>) => {
    dispatch({ type: FillActionType.LOAD_DRAFT, payload: draftAnswers });
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch({ type: FillActionType.RESET });
  }, [dispatch]);

  return {
    template,
    visibleFields,
    answers,
    visibilityMap,
    errors,
    submitted,
    submitError,
    completedCount,
    interactiveFieldCount,
    requiredTotal,
    setAnswer,
    getAnswer,
    isVisible,
    isRequired,
    getError,
    loadDraft,
    reset,
    submit,
  };
}
