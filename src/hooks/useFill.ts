import { useFillContext } from '../contexts/FillContext';
import type { FieldValue } from '../types/fields';
import { getPlugin } from '../registry';

export function useFill() {
  const { state, dispatch, submit } = useFillContext();
  const { template, answers, visibilityMap, errors, submitted, submitError } = state;

  const visibleFields = template.fields.filter((f) => visibilityMap.get(f.id)?.visible ?? true);

  function setAnswer(fieldId: string, value: FieldValue) {
    dispatch({ type: 'SET_ANSWER', payload: { fieldId, value } });
  }

  function getAnswer(fieldId: string): FieldValue {
    return answers.get(fieldId) ?? null;
  }

  function isVisible(fieldId: string): boolean {
    return visibilityMap.get(fieldId)?.visible ?? true;
  }

  function isRequired(fieldId: string): boolean {
    return visibilityMap.get(fieldId)?.required ?? false;
  }

  function getError(fieldId: string): string | null {
    return errors.get(fieldId) ?? null;
  }

  function loadDraft(draftAnswers: Map<string, FieldValue>) {
    dispatch({ type: 'LOAD_DRAFT', payload: draftAnswers });
  }

  function reset() {
    dispatch({ type: 'RESET' });
  }

  const completedCount = visibleFields.filter((f) => {
    const plugin = getPlugin(f.kind);
    if (plugin.isDisplayOnly || plugin.isComputed) return false;
    const val = answers.get(f.id);
    return val !== null && val !== undefined && val !== '';
  }).length;

  const requiredTotal = visibleFields.filter((f) => isRequired(f.id)).length;

  return {
    template,
    visibleFields,
    answers,
    visibilityMap,
    errors,
    submitted,
    submitError,
    completedCount,
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
