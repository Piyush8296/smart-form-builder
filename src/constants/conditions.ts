import { ConditionOperator, ConditionEffect } from '../enums';

export const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: ConditionOperator.EQUALS, label: 'equals' },
  { value: ConditionOperator.NOT_EQUALS, label: 'does not equal' },
  { value: ConditionOperator.CONTAINS, label: 'contains' },
  { value: ConditionOperator.GREATER_THAN, label: 'greater than' },
  { value: ConditionOperator.LESS_THAN, label: 'less than' },
  { value: ConditionOperator.IS_EMPTY, label: 'is empty' },
  { value: ConditionOperator.IS_NOT_EMPTY, label: 'is not empty' },
];

export const EFFECTS: { value: ConditionEffect; label: string }[] = [
  { value: ConditionEffect.SHOW, label: 'Show' },
  { value: ConditionEffect.HIDE, label: 'Hide' },
  { value: ConditionEffect.REQUIRE, label: 'Require' },
  { value: ConditionEffect.UNREQUIRE, label: 'Un-require' },
];

export const VALUELESS_OPS: ConditionOperator[] = [ConditionOperator.IS_EMPTY, ConditionOperator.IS_NOT_EMPTY];
