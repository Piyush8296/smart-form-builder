import { FieldGroup } from '../enums';

export const GROUP_LABELS: Record<FieldGroup, string> = {
  [FieldGroup.INPUT]: 'Input',
  [FieldGroup.SELECT]: 'Select',
  [FieldGroup.DISPLAY]: 'Display',
  [FieldGroup.SPECIAL]: 'Special',
};
