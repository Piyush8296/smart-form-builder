import type { Condition } from './conditions';

export type FieldKind =
  | 'text-single'
  | 'text-multi'
  | 'number'
  | 'date'
  | 'time'
  | 'email'
  | 'url'
  | 'address'
  | 'single-select'
  | 'multi-select'
  | 'file-upload'
  | 'section-header'
  | 'calculation'
  | 'rating'
  | 'linear-scale'
  | 'phone'
  | 'signature';

export const OTHER_OPTION_ID = '__other__';

interface FieldBase {
  id: string;
  kind: FieldKind;
  label: string;
  description?: string;
  conditions: Condition[];
  defaultVisible: boolean;
  defaultRequired: boolean;
  requiredMessage?: string;
}

export interface TextSingleConfig extends FieldBase {
  kind: 'text-single';
  placeholder?: string;
  defaultValue?: string;
  prefix?: string;
  suffix?: string;
  minLength?: number;
  maxLength?: number;
  validationPattern?: string;
  validationMessage?: string;
}

export interface TextMultiConfig extends FieldBase {
  kind: 'text-multi';
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  validationPattern?: string;
  validationMessage?: string;
}

export interface NumberConfig extends FieldBase {
  kind: 'number';
  placeholder?: string;
  defaultValue?: number;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  decimalPlaces?: number;
  step?: number;
  validationMessage?: string;
}

export interface DateConfig extends FieldBase {
  kind: 'date';
  prefillToday: boolean;
  minDate?: string;
  maxDate?: string;
  disabledDaysOfWeek?: number[];
  validationMessage?: string;
}

export interface TimeConfig extends FieldBase {
  kind: 'time';
  minTime?: string;
  maxTime?: string;
  validationMessage?: string;
}

export interface EmailConfig extends FieldBase {
  kind: 'email';
  placeholder?: string;
  validationMessage?: string;
}

export interface UrlConfig extends FieldBase {
  kind: 'url';
  placeholder?: string;
  validationMessage?: string;
}

export interface AddressConfig extends FieldBase {
  kind: 'address';
  includeStreet2: boolean;
  includeState: boolean;
  includeZip: boolean;
  countryFixed?: string;
  validationMessage?: string;
}

export interface SelectOption {
  id: string;
  label: string;
}

export type SingleSelectVariant = 'radio' | 'dropdown' | 'tiles' | 'combobox';

export interface SingleSelectConfig extends FieldBase {
  kind: 'single-select';
  options: SelectOption[];
  variant: SingleSelectVariant;
  allowOther: boolean;
  shuffleOptions: boolean;
  columns?: 1 | 2 | 3;
  validationMessage?: string;
}

export interface MultiSelectConfig extends FieldBase {
  kind: 'multi-select';
  options: SelectOption[];
  minSelections: number | null;
  maxSelections: number | null;
  searchable: boolean;
  allowOther: boolean;
  shuffleOptions: boolean;
  columns?: 1 | 2 | 3;
  validationMessage?: string;
}

export interface FileUploadConfig extends FieldBase {
  kind: 'file-upload';
  allowedTypes: string[];
  maxFiles: number;
  maxFileSizeMB?: number;
  validationMessage?: string;
}

export interface SectionHeaderConfig extends FieldBase {
  kind: 'section-header';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showDivider?: boolean;
}

export type CalculationOperation = 'sum' | 'avg' | 'min' | 'max';

export interface CalculationConfig extends FieldBase {
  kind: 'calculation';
  operation: CalculationOperation;
  sourceFieldIds: string[];
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export interface RatingConfig extends FieldBase {
  kind: 'rating';
  maxRating: 5 | 10;
  lowLabel?: string;
  highLabel?: string;
  validationMessage?: string;
}

export interface LinearScaleConfig extends FieldBase {
  kind: 'linear-scale';
  minValue: 0 | 1;
  maxValue: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  minLabel?: string;
  maxLabel?: string;
  validationMessage?: string;
}

export interface PhoneConfig extends FieldBase {
  kind: 'phone';
  defaultCountryCode?: string;
  validationMessage?: string;
}

export interface SignatureConfig extends FieldBase {
  kind: 'signature';
  validationMessage?: string;
}

export type FieldConfig =
  | TextSingleConfig
  | TextMultiConfig
  | NumberConfig
  | DateConfig
  | TimeConfig
  | EmailConfig
  | UrlConfig
  | AddressConfig
  | SingleSelectConfig
  | MultiSelectConfig
  | FileUploadConfig
  | SectionHeaderConfig
  | CalculationConfig
  | RatingConfig
  | LinearScaleConfig
  | PhoneConfig
  | SignatureConfig;

export interface AddressValue {
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
}

export type SignatureValue = { base64: string; width: number; height: number };

export type FieldValue =
  | string
  | number
  | string[]
  | boolean
  | SignatureValue
  | AddressValue
  | null;
