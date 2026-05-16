export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'less_than'
  | 'is_empty'
  | 'is_not_empty';

export type ConditionEffect = 'show' | 'hide' | 'require' | 'unrequire';

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
