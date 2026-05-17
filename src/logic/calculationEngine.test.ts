import { describe, it, expect } from 'vitest';
import { computeCalculation } from './calculationEngine';
import { CalculationOperation, FieldKind } from '../enums';
import type { CalculationConfig } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeCalcConfig(
  overrides: Partial<CalculationConfig> = {},
): CalculationConfig {
  return {
    id: 'calc-1',
    kind: FieldKind.CALCULATION,
    label: 'Result',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
    ...overrides,
  };
}

function makeVisibility(
  entries: Array<{ id: string; visible: boolean }>,
): Map<string, FieldVisibilityState> {
  const map = new Map<string, FieldVisibilityState>();
  for (const { id, visible } of entries) {
    map.set(id, { fieldId: id, visible, required: false });
  }
  return map;
}

function makeAnswers(entries: Array<[string, number | string | null]>): Map<string, import('../types/fields').FieldValue> {
  return new Map(entries);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('computeCalculation', () => {
  describe('SUM', () => {
    it('sums visible numeric fields', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a', 'b'] });
      const answers = makeAnswers([['a', 10], ['b', 5]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }, { id: 'b', visible: true }]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(15);
    });

    it('treats empty string as 0 for SUM', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a', 'b'] });
      const answers = makeAnswers([['a', ''], ['b', 3]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }, { id: 'b', visible: true }]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(3);
    });

    it('treats null as 0 for SUM', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a'] });
      const answers = makeAnswers([['a', null]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }]);

      // null pushes 0 only for SUM — but the code only pushes 0 then continues,
      // so values = [0] and sum = 0
      expect(computeCalculation(config, [], answers, visibility)).toBe(0);
    });

    it('skips hidden fields entirely', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a', 'b'] });
      const answers = makeAnswers([['a', 10], ['b', 5]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }, { id: 'b', visible: false }]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(10);
    });

    it('returns null when all source fields are hidden', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a'] });
      const answers = makeAnswers([['a', 10]]);
      const visibility = makeVisibility([{ id: 'a', visible: false }]);

      expect(computeCalculation(config, [], answers, visibility)).toBeNull();
    });

    it('returns null when sourceFieldIds is empty', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: [] });
      const answers = makeAnswers([]);
      const visibility = makeVisibility([]);

      expect(computeCalculation(config, [], answers, visibility)).toBeNull();
    });

    it('skips NaN values', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a', 'b'] });
      const answers = makeAnswers([['a', 'not-a-number'], ['b', 4]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }, { id: 'b', visible: true }]);

      // 'not-a-number' → NaN → skipped; only 4 is pushed
      expect(computeCalculation(config, [], answers, visibility)).toBe(4);
    });

    it('coerces string numbers', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.SUM, sourceFieldIds: ['a'] });
      const answers = makeAnswers([['a', '7']]);
      const visibility = makeVisibility([{ id: 'a', visible: true }]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(7);
    });
  });

  describe('AVG', () => {
    it('averages visible fields', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.AVG, sourceFieldIds: ['a', 'b', 'c'] });
      const answers = makeAnswers([['a', 10], ['b', 20], ['c', 30]]);
      const visibility = makeVisibility([
        { id: 'a', visible: true },
        { id: 'b', visible: true },
        { id: 'c', visible: true },
      ]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(20);
    });

    it('does not push 0 for null in AVG (skips instead)', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.AVG, sourceFieldIds: ['a', 'b'] });
      const answers = makeAnswers([['a', null], ['b', 10]]);
      const visibility = makeVisibility([{ id: 'a', visible: true }, { id: 'b', visible: true }]);

      // null with AVG: raw is null → no push (only SUM pushes 0) → only 10 in values → avg = 10
      expect(computeCalculation(config, [], answers, visibility)).toBe(10);
    });
  });

  describe('MIN', () => {
    it('returns the minimum value', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.MIN, sourceFieldIds: ['a', 'b', 'c'] });
      const answers = makeAnswers([['a', 5], ['b', 1], ['c', 3]]);
      const visibility = makeVisibility([
        { id: 'a', visible: true },
        { id: 'b', visible: true },
        { id: 'c', visible: true },
      ]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(1);
    });
  });

  describe('MAX', () => {
    it('returns the maximum value', () => {
      const config = makeCalcConfig({ operation: CalculationOperation.MAX, sourceFieldIds: ['a', 'b', 'c'] });
      const answers = makeAnswers([['a', 5], ['b', 1], ['c', 3]]);
      const visibility = makeVisibility([
        { id: 'a', visible: true },
        { id: 'b', visible: true },
        { id: 'c', visible: true },
      ]);

      expect(computeCalculation(config, [], answers, visibility)).toBe(5);
    });
  });
});
