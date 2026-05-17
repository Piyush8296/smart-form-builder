import { ConditionOperator, ConditionEffect } from '../enums';
import type { FieldConfig, FieldValue } from '../types/fields';
import type { Condition, FieldVisibilityState } from '../types/conditions';

function evaluateCondition(condition: Condition, targetValue: FieldValue): boolean {
  const { operator, value } = condition;

  if (operator === ConditionOperator.IS_EMPTY) {
    return targetValue === null || targetValue === '' || (Array.isArray(targetValue) && targetValue.length === 0);
  }
  if (operator === ConditionOperator.IS_NOT_EMPTY) {
    return targetValue !== null && targetValue !== '' && !(Array.isArray(targetValue) && targetValue.length === 0);
  }

  if (targetValue === null) return false;

  switch (operator) {
    case ConditionOperator.EQUALS:
      return String(targetValue) === String(value);
    case ConditionOperator.NOT_EQUALS:
      return String(targetValue) !== String(value);
    case ConditionOperator.CONTAINS:
      return typeof targetValue === 'string' && targetValue.includes(String(value));
    case ConditionOperator.GREATER_THAN:
      return typeof targetValue === 'number' && typeof value === 'number' && targetValue > value;
    case ConditionOperator.LESS_THAN:
      return typeof targetValue === 'number' && typeof value === 'number' && targetValue < value;
    default:
      return false;
  }
}

function topologicalSort(fields: FieldConfig[]): FieldConfig[] {
  const idToField = new Map(fields.map((f) => [f.id, f]));
  const dependents = new Map<string, Set<string>>();
  const inDegree = new Map<string, number>();

  for (const field of fields) {
    if (!inDegree.has(field.id)) inDegree.set(field.id, 0);
    const seenTargets = new Set<string>();
    for (const cond of field.conditions) {
      if (!dependents.has(cond.targetFieldId)) dependents.set(cond.targetFieldId, new Set());
      dependents.get(cond.targetFieldId)!.add(field.id);
      if (!seenTargets.has(cond.targetFieldId)) {
        seenTargets.add(cond.targetFieldId);
        inDegree.set(field.id, (inDegree.get(field.id) ?? 0) + 1);
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: FieldConfig[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const field = idToField.get(id);
    if (field) sorted.push(field);

    for (const depId of dependents.get(id) ?? []) {
      const newDeg = (inDegree.get(depId) ?? 1) - 1;
      inDegree.set(depId, newDeg);
      if (newDeg === 0) queue.push(depId);
    }
  }

  for (const field of fields) {
    if (!visited.has(field.id)) {
      console.warn(`[conditionEvaluator] cycle detected involving field "${field.id}" — falling back to defaultVisible`);
      sorted.push(field);
    }
  }

  return sorted;
}

export function evaluateAllFields(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
): Map<string, FieldVisibilityState> {
  const result = new Map<string, FieldVisibilityState>();

  for (const field of fields) {
    result.set(field.id, {
      fieldId: field.id,
      visible: field.defaultVisible,
      required: field.defaultRequired,
    });
  }

  const sorted = topologicalSort(fields);

  for (const field of sorted) {
    let visible = field.defaultVisible;
    let required = field.defaultRequired;

    for (const condition of field.conditions) {
      const targetState = result.get(condition.targetFieldId);
      const targetValue = targetState?.visible
        ? (answers.get(condition.targetFieldId) ?? null)
        : null;

      if (evaluateCondition(condition, targetValue)) {
        switch (condition.effect) {
          case ConditionEffect.SHOW:      visible = true;  break;
          case ConditionEffect.HIDE:      visible = false; break;
          case ConditionEffect.REQUIRE:   required = true; break;
          case ConditionEffect.UNREQUIRE: required = false; break;
        }
      }
    }

    result.set(field.id, { fieldId: field.id, visible, required });
  }

  return result;
}
