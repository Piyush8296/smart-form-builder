import type { Condition } from './conditions';
import { FieldKind, SingleSelectVariant, CalculationOperation, SectionHeaderSize } from '../enums';

export { FieldKind, SingleSelectVariant, CalculationOperation, SectionHeaderSize };

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
  kind: FieldKind.TEXT_SINGLE;
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
  kind: FieldKind.TEXT_MULTI;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
  validationPattern?: string;
  validationMessage?: string;
}

export interface NumberConfig extends FieldBase {
  kind: FieldKind.NUMBER;
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
  kind: FieldKind.DATE;
  prefillToday: boolean;
  minDate?: string;
  maxDate?: string;
  disabledDaysOfWeek?: number[];
  validationMessage?: string;
}

export interface TimeConfig extends FieldBase {
  kind: FieldKind.TIME;
  minTime?: string;
  maxTime?: string;
  validationMessage?: string;
}

export interface EmailConfig extends FieldBase {
  kind: FieldKind.EMAIL;
  placeholder?: string;
  validationMessage?: string;
}

export interface UrlConfig extends FieldBase {
  kind: FieldKind.URL;
  placeholder?: string;
  validationMessage?: string;
}

export interface AddressConfig extends FieldBase {
  kind: FieldKind.ADDRESS;
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


export interface SingleSelectConfig extends FieldBase {
  kind: FieldKind.SINGLE_SELECT;
  options: SelectOption[];
  variant: SingleSelectVariant;
  allowOther: boolean;
  shuffleOptions: boolean;
  columns?: 1 | 2 | 3;
  validationMessage?: string;
}

export interface MultiSelectConfig extends FieldBase {
  kind: FieldKind.MULTI_SELECT;
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
  kind: FieldKind.FILE_UPLOAD;
  allowedTypes: string[];
  maxFiles: number;
  maxFileSizeMB?: number;
  validationMessage?: string;
}

export interface SectionHeaderConfig extends FieldBase {
  kind: FieldKind.SECTION_HEADER;
  size: SectionHeaderSize;
  showDivider?: boolean;
}


export interface CalculationConfig extends FieldBase {
  kind: FieldKind.CALCULATION;
  operation: CalculationOperation;
  sourceFieldIds: string[];
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
}

export interface RatingConfig extends FieldBase {
  kind: FieldKind.RATING;
  maxRating: 5 | 10;
  lowLabel?: string;
  highLabel?: string;
  validationMessage?: string;
}

export interface LinearScaleConfig extends FieldBase {
  kind: FieldKind.LINEAR_SCALE;
  minValue: 0 | 1;
  maxValue: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  minLabel?: string;
  maxLabel?: string;
  validationMessage?: string;
}

export interface PhoneConfig extends FieldBase {
  kind: FieldKind.PHONE;
  defaultCountryCode?: string;
  validationMessage?: string;
}

export interface SignatureConfig extends FieldBase {
  kind: FieldKind.SIGNATURE;
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
