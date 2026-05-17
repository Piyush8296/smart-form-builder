import { CalculationOperation } from '../enums';
import type { FieldConfig, FieldValue, CalculationConfig } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';

export function computeCalculation(
  config: CalculationConfig,
  _fields: FieldConfig[],
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): number | null {
  const values: number[] = [];

  for (const srcId of config.sourceFieldIds) {
    const state = visibilityMap.get(srcId);
    if (!state?.visible) continue;

    const raw = answers.get(srcId);
    if (raw === null || raw === undefined || raw === '') {
      if (config.operation === CalculationOperation.SUM) values.push(0);
      continue;
    }
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!isNaN(n)) values.push(n);
  }

  if (values.length === 0) return null;

  switch (config.operation) {
    case CalculationOperation.SUM: return values.reduce((a, b) => a + b, 0);
    case CalculationOperation.AVG: return values.reduce((a, b) => a + b, 0) / values.length;
    case CalculationOperation.MIN: return Math.min(...values);
    case CalculationOperation.MAX: return Math.max(...values);
  }
}
