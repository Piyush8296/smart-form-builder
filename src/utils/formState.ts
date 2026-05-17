import { FieldKind } from '../enums';
import type { FieldConfig, FieldValue } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';
import { evaluateAllFields } from '../logic/conditionEvaluator';
import { computeCalculation } from '../logic/calculationEngine';

export function buildInitialAnswers(fields: FieldConfig[]): Map<string, FieldValue> {
  const answers = new Map<string, FieldValue>();
  for (const field of fields) {
    if ('defaultValue' in field && field.defaultValue !== undefined) {
      answers.set(field.id, field.defaultValue as FieldValue);
    }
  }
  return answers;
}

export function applyCalculations(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): Map<string, FieldValue> {
  const updated = new Map(answers);
  for (const field of fields) {
    if (field.kind === FieldKind.CALCULATION) {
      const result = computeCalculation(field, fields, updated, visibilityMap);
      updated.set(field.id, result);
    }
  }
  return updated;
}

export function clearHiddenAnswers(
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): Map<string, FieldValue> {
  const updated = new Map(answers);
  for (const [fieldId, state] of visibilityMap) {
    if (!state.visible) updated.set(fieldId, null);
  }
  return updated;
}

export function recomputeState(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
): { answers: Map<string, FieldValue>; visibilityMap: Map<string, FieldVisibilityState> } {
  const visibilityMap = evaluateAllFields(fields, answers);
  const clearedAnswers = clearHiddenAnswers(answers, visibilityMap);
  const finalAnswers = applyCalculations(fields, clearedAnswers, visibilityMap);
  return { answers: finalAnswers, visibilityMap };
}
