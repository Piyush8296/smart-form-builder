import { describe, it, expect } from 'vitest';
import { evaluateAllFields } from './conditionEvaluator';
import { ConditionOperator, ConditionEffect, FieldKind } from '../enums';
import type { FieldConfig } from '../types/fields';
import type { Condition } from '../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

let _idCounter = 0;
function nextId(prefix = 'f'): string {
  return `${prefix}-${++_idCounter}`;
}

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

function makeCondition(overrides: Partial<Condition> = {}): Condition {
  return {
    id: nextId('cond'),
    targetFieldId: 'trigger',
    operator: ConditionOperator.EQUALS,
    value: 'yes',
    effect: ConditionEffect.SHOW,
    ...overrides,
  };
}

function makeAnswers(
  entries: Array<[string, string | number | null]>,
): Map<string, import('../types/fields').FieldValue> {
  return new Map(entries);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('evaluateAllFields', () => {
  describe('default visibility', () => {
    it('returns defaultVisible=true for a field with no conditions', () => {
      const field = makeTextField('f1');
      const result = evaluateAllFields([field], new Map());
      expect(result.get('f1')?.visible).toBe(true);
    });

    it('returns defaultVisible=false for a field configured as hidden', () => {
      const field = makeTextField('f1', { defaultVisible: false });
      const result = evaluateAllFields([field], new Map());
      expect(result.get('f1')?.visible).toBe(false);
    });

    it('returns defaultRequired for required fields', () => {
      const field = makeTextField('f1', { defaultRequired: true });
      const result = evaluateAllFields([field], new Map());
      expect(result.get('f1')?.required).toBe(true);
    });
  });

  describe('EQUALS operator', () => {
    it('applies SHOW effect when answer equals condition value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.EQUALS, value: 'yes', effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'yes']]));
      expect(result.get('target')?.visible).toBe(true);
    });

    it('does not apply SHOW effect when answer does not match', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.EQUALS, value: 'yes', effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'no']]));
      expect(result.get('target')?.visible).toBe(false);
    });
  });

  describe('NOT_EQUALS operator', () => {
    it('applies HIDE effect when answer is different from condition value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: true,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.NOT_EQUALS, value: 'yes', effect: ConditionEffect.HIDE })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'no']]));
      expect(result.get('target')?.visible).toBe(false);
    });
  });

  describe('CONTAINS operator', () => {
    it('applies effect when string answer contains the value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.CONTAINS, value: 'foo', effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'foobar']]));
      expect(result.get('target')?.visible).toBe(true);
    });

    it('does not apply effect when string does not contain the value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.CONTAINS, value: 'baz', effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'foobar']]));
      expect(result.get('target')?.visible).toBe(false);
    });
  });

  describe('GREATER_THAN / LESS_THAN operators', () => {
    it('applies SHOW effect when number is greater than condition value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.GREATER_THAN, value: 5, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 10]]));
      expect(result.get('target')?.visible).toBe(true);
    });

    it('does not apply SHOW when number is equal to condition value for GREATER_THAN', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.GREATER_THAN, value: 5, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 5]]));
      expect(result.get('target')?.visible).toBe(false);
    });

    it('applies SHOW effect when number is less than condition value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.LESS_THAN, value: 5, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 3]]));
      expect(result.get('target')?.visible).toBe(true);
    });
  });

  describe('IS_EMPTY / IS_NOT_EMPTY operators', () => {
    it('IS_EMPTY matches null', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.IS_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', null]]));
      expect(result.get('target')?.visible).toBe(true);
    });

    it('IS_EMPTY matches empty string', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.IS_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', '']]));
      expect(result.get('target')?.visible).toBe(true);
    });

    it('IS_EMPTY does not match a non-empty value', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.IS_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'hello']]));
      expect(result.get('target')?.visible).toBe(false);
    });

    it('IS_NOT_EMPTY matches when value is present', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.IS_NOT_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'hello']]));
      expect(result.get('target')?.visible).toBe(true);
    });
  });

  describe('REQUIRE / UNREQUIRE effects', () => {
    it('applies REQUIRE effect when condition matches', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: true,
        defaultRequired: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.EQUALS, value: 'yes', effect: ConditionEffect.REQUIRE })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'yes']]));
      expect(result.get('target')?.required).toBe(true);
    });

    it('applies UNREQUIRE effect when condition matches', () => {
      const trigger = makeTextField('trigger');
      const target = makeTextField('target', {
        defaultVisible: true,
        defaultRequired: true,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.EQUALS, value: 'opt-out', effect: ConditionEffect.UNREQUIRE })],
      });

      const result = evaluateAllFields([trigger, target], makeAnswers([['trigger', 'opt-out']]));
      expect(result.get('target')?.required).toBe(false);
    });
  });

  describe('dependency ordering', () => {
    it('evaluates chained conditions in topological order', () => {
      // fieldA → condition on fieldB's answer → fieldC's visibility depends on fieldA's condition
      // chain: trigger → fieldA (show when trigger='yes') → fieldC (show when fieldA visible + 'active')
      const trigger = makeTextField('trigger');
      const fieldA = makeTextField('fieldA', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'trigger', operator: ConditionOperator.EQUALS, value: 'yes', effect: ConditionEffect.SHOW })],
      });
      const fieldC = makeTextField('fieldC', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'fieldA', operator: ConditionOperator.IS_NOT_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      const answers = makeAnswers([['trigger', 'yes'], ['fieldA', 'active']]);
      const result = evaluateAllFields([trigger, fieldA, fieldC], answers);

      expect(result.get('fieldA')?.visible).toBe(true);
      // fieldA is visible and has value, so fieldC should become visible
      expect(result.get('fieldC')?.visible).toBe(true);
    });

    it('treats a hidden trigger field answer as null', () => {
      // fieldA is hidden; fieldC condition on fieldA should treat fieldA value as null
      const fieldA = makeTextField('fieldA', { defaultVisible: false });
      const fieldC = makeTextField('fieldC', {
        defaultVisible: false,
        conditions: [makeCondition({ targetFieldId: 'fieldA', operator: ConditionOperator.IS_NOT_EMPTY, value: null, effect: ConditionEffect.SHOW })],
      });

      // fieldA has a value in answers but is hidden — condition should not fire
      const answers = makeAnswers([['fieldA', 'something']]);
      const result = evaluateAllFields([fieldA, fieldC], answers);

      expect(result.get('fieldC')?.visible).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('returns an empty map when no fields are provided', () => {
      const result = evaluateAllFields([], new Map());
      expect(result.size).toBe(0);
    });

    it('handles a field whose targetFieldId does not exist in the field list', () => {
      const field = makeTextField('f1', {
        conditions: [makeCondition({ targetFieldId: 'ghost', operator: ConditionOperator.EQUALS, value: 'x', effect: ConditionEffect.SHOW })],
        defaultVisible: false,
      });

      const result = evaluateAllFields([field], makeAnswers([]));
      // ghost field has no state → condition evaluation falls back to targetValue=null → EQUALS 'x' is false → stays hidden
      expect(result.get('f1')?.visible).toBe(false);
    });
  });
});
