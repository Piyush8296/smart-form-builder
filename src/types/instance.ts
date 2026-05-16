import type { FieldConfig } from './fields';
import type { FieldValue } from './fields';

export interface FieldAnswer {
  fieldId: string;
  value: FieldValue;
  fieldSnapshot: FieldConfig;
}

export interface Instance {
  id: string;
  templateId: string;
  answers: FieldAnswer[];
  submittedAt: string;
  createdAt: string;
}

export interface InstanceSummary {
  id: string;
  templateId: string;
  submittedAt: string;
}
