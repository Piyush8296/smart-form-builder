import { describe, it, expect } from 'vitest';
import {
  buildInitialAnswers,
  applyCalculations,
  clearHiddenAnswers,
  recomputeState,
} from './formState';
import { FieldKind, CalculationOperation, ConditionOperator, ConditionEffect } from '../enums';
import type { FieldConfig, CalculationConfig, FieldValue } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTextField(
  id: string,
  overrides: Partial<FieldConfig> = {},
): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label: id,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  } as FieldConfig;
}

function makeCalcField(
  id: string,
  overrides: Partial<CalculationConfig> = {},
): CalculationConfig {
  return {
    id,
    kind: FieldKind.CALCULATION,
    label: id,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
    ...overrides,
  };
}

function makeVisibility(
  entries: Array<{ id: string; visible: boolean; required?: boolean }>,
): Map<string, FieldVisibilityState> {
  const map = new Map<string, FieldVisibilityState>();
  for (const { id, visible, required = false } of entries) {
    map.set(id, { fieldId: id, visible, required });
  }
  return map;
}

// ---------------------------------------------------------------------------
// buildInitialAnswers
// ---------------------------------------------------------------------------

describe('buildInitialAnswers', () => {
  it('returns an empty map when no fields have defaultValues', () => {
    const fields = [makeTextField('f1'), makeTextField('f2')];
    const result = buildInitialAnswers(fields);
    expect(result.size).toBe(0);
  });

  it('seeds the map with fields that carry defaultValue', () => {
    const fields = [
      makeTextField('f1', { defaultValue: 'hello' } as Partial<FieldConfig>),
      makeTextField('f2'),
    ];
    const result = buildInitialAnswers(fields);
    expect(result.get('f1')).toBe('hello');
    expect(result.has('f2')).toBe(false);
  });

  it('seeds numeric defaultValues', () => {
    const fields = [
      {
        id: 'num1',
        kind: FieldKind.NUMBER,
        label: 'Num',
        conditions: [],
        defaultVisible: true,
        defaultRequired: false,
        defaultValue: 42,
      } as FieldConfig,
    ];
    const result = buildInitialAnswers(fields);
    expect(result.get('num1')).toBe(42);
  });

  it('handles empty field list', () => {
    expect(buildInitialAnswers([])).toEqual(new Map());
  });
});

// ---------------------------------------------------------------------------
// applyCalculations
// ---------------------------------------------------------------------------

describe('applyCalculations', () => {
  it('sets a calculation field value based on visible source fields', () => {
    const sourceA = makeTextField('a');
    const sourceB = makeTextField('b');
    const calc = makeCalcField('total', {
      operation: CalculationOperation.SUM,
      sourceFieldIds: ['a', 'b'],
    });
    const fields: FieldConfig[] = [sourceA, sourceB, calc];
    const answers = new Map<string, FieldValue>([['a', 10], ['b', 5]]);
    const visibility = makeVisibility([
      { id: 'a', visible: true },
      { id: 'b', visible: true },
      { id: 'total', visible: true },
    ]);

    const result = applyCalculations(fields, answers, visibility);
    expect(result.get('total')).toBe(15);
  });

  it('returns null for the calc field when all sources are hidden', () => {
    const source = makeTextField('a');
    const calc = makeCalcField('total', {
      operation: CalculationOperation.SUM,
      sourceFieldIds: ['a'],
    });
    const answers = new Map<string, FieldValue>([['a', 10]]);
    const visibility = makeVisibility([
      { id: 'a', visible: false },
      { id: 'total', visible: true },
    ]);

    const result = applyCalculations([source, calc], answers, visibility);
    expect(result.get('total')).toBeNull();
  });

  it('does not mutate the original answers map', () => {
    const calc = makeCalcField('total', {
      operation: CalculationOperation.SUM,
      sourceFieldIds: [],
    });
    const original = new Map<string, FieldValue>([['x', 1]]);
    applyCalculations([calc], original, new Map());
    expect(original.get('x')).toBe(1);
  });

  it('only processes CALCULATION kind fields and leaves others unchanged', () => {
    const nonCalc = makeTextField('plain');
    const answers = new Map<string, FieldValue>([['plain', 'value']]);
    const result = applyCalculations([nonCalc], answers, makeVisibility([{ id: 'plain', visible: true }]));
    // plain field must remain untouched
    expect(result.get('plain')).toBe('value');
  });
});

// ---------------------------------------------------------------------------
// clearHiddenAnswers
// ---------------------------------------------------------------------------

describe('clearHiddenAnswers', () => {
  it('sets hidden field values to null', () => {
    const answers = new Map<string, FieldValue>([['f1', 'hello'], ['f2', 'world']]);
    const visibility = makeVisibility([
      { id: 'f1', visible: false },
      { id: 'f2', visible: true },
    ]);

    const result = clearHiddenAnswers(answers, visibility);
    expect(result.get('f1')).toBeNull();
    expect(result.get('f2')).toBe('world');
  });

  it('does not mutate the original map', () => {
    const answers = new Map<string, FieldValue>([['f1', 'hello']]);
    const visibility = makeVisibility([{ id: 'f1', visible: false }]);
    clearHiddenAnswers(answers, visibility);
    expect(answers.get('f1')).toBe('hello');
  });

  it('returns the same values when all fields are visible', () => {
    const answers = new Map<string, FieldValue>([['f1', 'a'], ['f2', 'b']]);
    const visibility = makeVisibility([
      { id: 'f1', visible: true },
      { id: 'f2', visible: true },
    ]);

    const result = clearHiddenAnswers(answers, visibility);
    expect(result.get('f1')).toBe('a');
    expect(result.get('f2')).toBe('b');
  });

  it('ignores visibility entries for fields not in the answers map', () => {
    const answers = new Map<string, FieldValue>([['f1', 'hello']]);
    const visibility = makeVisibility([{ id: 'ghost', visible: false }]);
    const result = clearHiddenAnswers(answers, visibility);
    expect(result.get('f1')).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// recomputeState — integration
// ---------------------------------------------------------------------------

describe('recomputeState', () => {
  it('returns visibility and answers together', () => {
    const field = makeTextField('f1');
    const answers = new Map<string, FieldValue>([['f1', 'hello']]);
    const { answers: a, visibilityMap: v } = recomputeState([field], answers);
    expect(v.get('f1')?.visible).toBe(true);
    expect(a.get('f1')).toBe('hello');
  });

  it('clears a hidden field answer and runs calculations', () => {
    // f1 (trigger) → when 'hide', f2 becomes hidden
    const f1 = makeTextField('f1');
    const f2 = makeTextField('f2', {
      defaultVisible: true,
      conditions: [
        {
          id: 'c1',
          targetFieldId: 'f1',
          operator: ConditionOperator.EQUALS,
          value: 'hide',
          effect: ConditionEffect.HIDE,
        },
      ],
    });
    const calc = makeCalcField('calc', {
      operation: CalculationOperation.SUM,
      sourceFieldIds: ['f1'],
      defaultVisible: true,
    });

    const answers = new Map<string, FieldValue>([['f1', 5], ['f2', 'should-be-cleared']]);
    // f1 = 5 (not 'hide'), so f2 stays visible; calc sums f1
    const { answers: a, visibilityMap: v } = recomputeState([f1, f2, calc], answers);

    expect(v.get('f2')?.visible).toBe(true);
    expect(a.get('f2')).toBe('should-be-cleared');
    expect(a.get('calc')).toBe(5);
  });

  it('clears hidden field when condition fires', () => {
    const f1 = makeTextField('f1');
    const f2 = makeTextField('f2', {
      defaultVisible: true,
      conditions: [
        {
          id: 'c1',
          targetFieldId: 'f1',
          operator: ConditionOperator.EQUALS,
          value: 'hide',
          effect: ConditionEffect.HIDE,
        },
      ],
    });

    const answers = new Map<string, FieldValue>([['f1', 'hide'], ['f2', 'data']]);
    const { answers: a, visibilityMap: v } = recomputeState([f1, f2], answers);

    expect(v.get('f2')?.visible).toBe(false);
    expect(a.get('f2')).toBeNull();
  });
});
