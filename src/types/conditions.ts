import { ConditionOperator, ConditionEffect } from '../enums';

export { ConditionOperator, ConditionEffect };

export interface Condition {
  id: string;
  targetFieldId: string;
  operator: ConditionOperator;
  value: string | number | null;
  effect: ConditionEffect;
}

export interface FieldVisibilityState {
  fieldId: string;
  visible: boolean;
  required: boolean;
}
