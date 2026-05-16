import type { FieldConfig } from './fields';

export interface TemplateSettings {
  showProgressBar: boolean;
  confirmationMessage: string;
  showSubmitAnotherLink: boolean;
  autoSaveDraft: boolean;
  allowResponseEditing: boolean;
}

export const DEFAULT_TEMPLATE_SETTINGS = {
  showProgressBar: false,
  confirmationMessage: 'Your response has been submitted.',
  showSubmitAnotherLink: true,
  autoSaveDraft: false,
  allowResponseEditing: false,
} satisfies TemplateSettings;

export interface Template {
  id: string;
  title: string;
  description: string;
  fields: FieldConfig[];
  settings: TemplateSettings;
  createdAt: string;
  updatedAt: string;
  isDraft?: boolean;
}

export interface TemplateSummary {
  id: string;
  title: string;
  fieldCount: number;
  updatedAt: string;
}
