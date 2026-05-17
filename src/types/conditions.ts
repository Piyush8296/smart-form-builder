import { ConditionOperator, ConditionEffect } from '../enums';

export { ConditionOperator, ConditionEffect };

export interface Condition {
  id: string;
  targetFieldId: string;
  operator: ConditionOperator;
  value: string | number | null;
  value2?: number | null; // upper bound for IS_WITHIN_RANGE
  effect: ConditionEffect;
}

export interface FieldVisibilityState {
  fieldId: string;
  visible: boolean;
  required: boolean;
}
