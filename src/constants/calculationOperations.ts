import { CalculationOperation } from '../enums';

export const CALCULATION_OPERATIONS: { value: CalculationOperation; label: string }[] = [
  { value: CalculationOperation.SUM, label: 'Sum' },
  { value: CalculationOperation.AVG, label: 'Average' },
  { value: CalculationOperation.MIN, label: 'Min' },
  { value: CalculationOperation.MAX, label: 'Max' },
];
