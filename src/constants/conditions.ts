import { ConditionOperator, ConditionEffect, FieldKind } from '../enums';

export const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: ConditionOperator.EQUALS, label: 'equals' },
  { value: ConditionOperator.NOT_EQUALS, label: 'does not equal' },
  { value: ConditionOperator.CONTAINS, label: 'contains' },
  { value: ConditionOperator.GREATER_THAN, label: 'greater than' },
  { value: ConditionOperator.LESS_THAN, label: 'less than' },
  { value: ConditionOperator.IS_BEFORE, label: 'is before' },
  { value: ConditionOperator.IS_AFTER, label: 'is after' },
  { value: ConditionOperator.IS_WITHIN_RANGE, label: 'is within range' },
  { value: ConditionOperator.CONTAINS_ANY_OF, label: 'contains any of' },
  { value: ConditionOperator.CONTAINS_ALL_OF, label: 'contains all of' },
  { value: ConditionOperator.CONTAINS_NONE_OF, label: 'contains none of' },
  { value: ConditionOperator.IS_EMPTY, label: 'is empty' },
  { value: ConditionOperator.IS_NOT_EMPTY, label: 'is not empty' },
];

export const EFFECTS: { value: ConditionEffect; label: string }[] = [
  { value: ConditionEffect.SHOW, label: 'Show' },
  { value: ConditionEffect.HIDE, label: 'Hide' },
  { value: ConditionEffect.REQUIRE, label: 'Require' },
  { value: ConditionEffect.UNREQUIRE, label: 'Un-require' },
];

export const VALUELESS_OPS: ConditionOperator[] = [
  ConditionOperator.IS_EMPTY,
  ConditionOperator.IS_NOT_EMPTY,
];

export const MULTI_VALUE_OPS: ConditionOperator[] = [
  ConditionOperator.CONTAINS_ANY_OF,
  ConditionOperator.CONTAINS_ALL_OF,
  ConditionOperator.CONTAINS_NONE_OF,
];

// Reusable operator groups for composing OPERATORS_BY_KIND
const EMPTY_OPS = [ConditionOperator.IS_EMPTY, ConditionOperator.IS_NOT_EMPTY] as const;
const EQ_OPS = [ConditionOperator.EQUALS, ConditionOperator.NOT_EQUALS] as const;
const TEXT_OPS = [...EQ_OPS, ConditionOperator.CONTAINS, ...EMPTY_OPS] as const;
const NUMERIC_OPS = [...EQ_OPS, ConditionOperator.GREATER_THAN, ConditionOperator.LESS_THAN, ConditionOperator.IS_WITHIN_RANGE, ...EMPTY_OPS] as const;
const DATE_OPS = [ConditionOperator.EQUALS, ConditionOperator.IS_BEFORE, ConditionOperator.IS_AFTER, ...EMPTY_OPS] as const;
const SELECT_OPS = [...EQ_OPS, ...EMPTY_OPS] as const;
const MULTI_SELECT_OPS = [...MULTI_VALUE_OPS, ...EMPTY_OPS] as const;

/** Operators valid for each field kind. Falls back to DEFAULT_OPERATORS. */
export const OPERATORS_BY_KIND: Partial<Record<FieldKind, readonly ConditionOperator[]>> = {
  [FieldKind.TEXT_SINGLE]: TEXT_OPS,
  [FieldKind.TEXT_MULTI]:  TEXT_OPS,
  [FieldKind.EMAIL]:       TEXT_OPS,
  [FieldKind.URL]:         TEXT_OPS,
  [FieldKind.NUMBER]:      NUMERIC_OPS,
  [FieldKind.RATING]:      NUMERIC_OPS,
  [FieldKind.LINEAR_SCALE]: NUMERIC_OPS,
  [FieldKind.DATE]:        DATE_OPS,
  [FieldKind.SINGLE_SELECT]: SELECT_OPS,
  [FieldKind.MULTI_SELECT]:  MULTI_SELECT_OPS,
  [FieldKind.PHONE]:       [...EQ_OPS, ...EMPTY_OPS],
};

export const DEFAULT_OPERATORS: readonly ConditionOperator[] = [...EQ_OPS, ...EMPTY_OPS];
