import type { ComponentType } from 'react';
import type { FieldConfig, FieldKind, FieldValue } from './fields';
import type { FieldVisibilityState } from './conditions';

export interface ConfigEditorProps<T extends FieldConfig> {
  config: T;
  allFields: FieldConfig[];
  onChange: (updated: T) => void;
}

export interface FieldRendererProps<T extends FieldConfig> {
  config: T;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error: string | null;
  disabled: boolean;
  visibilityState: FieldVisibilityState;
}

export interface FieldPlugin<T extends FieldConfig> {
  kind: FieldKind;
  displayName: string;
  icon: string;
  group: 'input' | 'select' | 'display' | 'special';

  createDefault: (id: string) => T;

  ConfigEditor: ComponentType<ConfigEditorProps<T>>;
  FieldRenderer: ComponentType<FieldRendererProps<T>>;

  validate: (value: FieldValue, config: T, required: boolean) => string | null;
  formatForPrint: (value: FieldValue, config: T) => string | null;

  isDisplayOnly?: boolean;
  isComputed?: boolean;
}
