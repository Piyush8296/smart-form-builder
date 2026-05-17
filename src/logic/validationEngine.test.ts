import { describe, it, expect } from 'vitest';
import { validateAll } from './validationEngine';
import { FieldKind } from '../enums';
import type { FieldConfig } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTextField(id: string, overrides: Partial<FieldConfig> = {}): FieldConfig {
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

function makeSectionHeader(id: string): FieldConfig {
  return {
    id,
    kind: FieldKind.SECTION_HEADER,
    label: id,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    size: 'md' as never,
  };
}

function makeCalcField(id: string): FieldConfig {
  return {
    id,
    kind: FieldKind.CALCULATION,
    label: id,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    operation: 'sum' as never,
    sourceFieldIds: [],
  };
}

function makeVisibility(entries: Array<{ id: string; visible: boolean; required?: boolean }>): Map<string, FieldVisibilityState> {
  const map = new Map<string, FieldVisibilityState>();
  for (const { id, visible, required = false } of entries) {
    map.set(id, { fieldId: id, visible, required });
  }
  return map;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('validateAll', () => {
  it('returns an empty map when all fields are valid', () => {
    const fields = [makeTextField('f1'), makeTextField('f2')];
    const answers = new Map([['f1', 'hello'], ['f2', 'world']]);
    const visibility = makeVisibility([{ id: 'f1', visible: true }, { id: 'f2', visible: true }]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.size).toBe(0);
  });

  it('returns an error for a required field with no answer', () => {
    const fields = [makeTextField('f1', { defaultRequired: false })];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    const visibility = makeVisibility([{ id: 'f1', visible: true, required: true }]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.has('f1')).toBe(true);
    expect(errors.get('f1')).toMatch(/required/i);
  });

  it('skips hidden fields even if they are required', () => {
    const fields = [makeTextField('f1')];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    const visibility = makeVisibility([{ id: 'f1', visible: false, required: true }]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.size).toBe(0);
  });

  it('skips display-only fields (section headers)', () => {
    const fields = [makeSectionHeader('s1')];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    const visibility = makeVisibility([{ id: 's1', visible: true, required: true }]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.size).toBe(0);
  });

  it('skips computed fields (calculations)', () => {
    const fields = [makeCalcField('c1')];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    const visibility = makeVisibility([{ id: 'c1', visible: true, required: true }]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.size).toBe(0);
  });

  it('collects errors from multiple invalid fields', () => {
    const fields = [makeTextField('f1'), makeTextField('f2')];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    const visibility = makeVisibility([
      { id: 'f1', visible: true, required: true },
      { id: 'f2', visible: true, required: true },
    ]);
    const errors = validateAll(fields, answers, visibility);
    expect(errors.size).toBe(2);
    expect(errors.has('f1')).toBe(true);
    expect(errors.has('f2')).toBe(true);
  });

  it('does not add an error entry for fields with null visibility state', () => {
    const fields = [makeTextField('ghost')];
    const answers = new Map<string, import('../types/fields').FieldValue>();
    // No entry in visibility map — state?.visible is undefined/falsy → field skipped
    const errors = validateAll(fields, answers, new Map());
    expect(errors.size).toBe(0);
  });

  it('validates field-level constraints beyond required', () => {
    // minLength constraint
    const field = makeTextField('f1', { minLength: 10 } as Partial<FieldConfig>);
    const answers = new Map<string, import('../types/fields').FieldValue>([['f1', 'short']]);
    const visibility = makeVisibility([{ id: 'f1', visible: true, required: false }]);
    const errors = validateAll([field], answers, visibility);
    expect(errors.has('f1')).toBe(true);
    expect(errors.get('f1')).toMatch(/at least 10/i);
  });

  it('returns an empty map when fields array is empty', () => {
    expect(validateAll([], new Map(), new Map()).size).toBe(0);
  });
});
