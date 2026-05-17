import { describe, it, expect } from 'vitest';
import { fillReducer, buildInitialState, type FillState } from './fillReducer';
import { FillActionType, FieldKind, ConditionOperator, ConditionEffect } from '../enums';
import type { Template } from '../types/template';
import type { FieldConfig, FieldValue } from '../types/fields';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';

// ---------------------------------------------------------------------------
// Factories
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

function makeTemplate(fields: FieldConfig[] = []): Template {
  const now = new Date().toISOString();
  return {
    id: 'tmpl-1',
    title: 'Test',
    description: '',
    fields,
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

function makeState(template: Template): FillState {
  return buildInitialState(template);
}

// ---------------------------------------------------------------------------
// buildInitialState
// ---------------------------------------------------------------------------

describe('buildInitialState', () => {
  it('initialises with empty errors map and not submitted', () => {
    const state = buildInitialState(makeTemplate([makeTextField('f1')]));
    expect(state.errors.size).toBe(0);
    expect(state.submitted).toBe(false);
    expect(state.submitError).toBeNull();
  });

  it('runs initial calculations via recomputeState', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = buildInitialState(template);
    expect(state.visibilityMap.get('f1')?.visible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SET_ANSWER
// ---------------------------------------------------------------------------

describe('fillReducer — SET_ANSWER', () => {
  it('sets the answer for the given field', () => {
    const state = makeState(makeTemplate([makeTextField('f1')]));
    const next = fillReducer(state, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'f1', value: 'hello' } });
    expect(next.answers.get('f1')).toBe('hello');
  });

  it('clears the error for the field that was answered', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = makeState(template);
    const stateWithError = fillReducer(state, {
      type: FillActionType.SET_ERRORS,
      payload: new Map([['f1', 'Required']]),
    });
    expect(stateWithError.errors.has('f1')).toBe(true);

    const next = fillReducer(stateWithError, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'f1', value: 'value' } });
    expect(next.errors.has('f1')).toBe(false);
  });

  it('keeps errors for other fields when one field is answered', () => {
    const template = makeTemplate([makeTextField('f1'), makeTextField('f2')]);
    const state = makeState(template);
    const stateWithErrors = fillReducer(state, {
      type: FillActionType.SET_ERRORS,
      payload: new Map([['f1', 'Err1'], ['f2', 'Err2']]),
    });

    const next = fillReducer(stateWithErrors, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'f1', value: 'x' } });
    expect(next.errors.has('f1')).toBe(false);
    expect(next.errors.get('f2')).toBe('Err2');
  });

  it('re-evaluates visibility after an answer change', () => {
    const trigger = makeTextField('trigger');
    const dependent = makeTextField('dep', {
      defaultVisible: false,
      conditions: [{
        id: 'c1',
        targetFieldId: 'trigger',
        operator: ConditionOperator.EQUALS,
        value: 'show',
        effect: ConditionEffect.SHOW,
      }],
    });
    const template = makeTemplate([trigger, dependent]);
    const state = makeState(template);
    expect(state.visibilityMap.get('dep')?.visible).toBe(false);

    const next = fillReducer(state, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'trigger', value: 'show' } });
    expect(next.visibilityMap.get('dep')?.visible).toBe(true);
  });

  it('does not mutate the original answers map', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = makeState(template);
    const originalAnswers = state.answers;
    fillReducer(state, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'f1', value: 'x' } });
    expect(originalAnswers.has('f1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SET_ERRORS
// ---------------------------------------------------------------------------

describe('fillReducer — SET_ERRORS', () => {
  it('replaces the entire errors map', () => {
    const state = makeState(makeTemplate([makeTextField('f1')]));
    const errors = new Map<string, string>([['f1', 'Required']]);
    const next = fillReducer(state, { type: FillActionType.SET_ERRORS, payload: errors });
    expect(next.errors.get('f1')).toBe('Required');
  });

  it('clears errors when an empty map is passed', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = makeState(template);
    const withErrors = fillReducer(state, { type: FillActionType.SET_ERRORS, payload: new Map([['f1', 'err']]) });
    const next = fillReducer(withErrors, { type: FillActionType.SET_ERRORS, payload: new Map() });
    expect(next.errors.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// SET_SUBMIT_ERROR
// ---------------------------------------------------------------------------

describe('fillReducer — SET_SUBMIT_ERROR', () => {
  it('sets a submit error message', () => {
    const state = makeState(makeTemplate([]));
    const next = fillReducer(state, { type: FillActionType.SET_SUBMIT_ERROR, payload: 'Network error' });
    expect(next.submitError).toBe('Network error');
  });

  it('clears submit error when null is passed', () => {
    const template = makeTemplate([]);
    const state = makeState(template);
    const withError = fillReducer(state, { type: FillActionType.SET_SUBMIT_ERROR, payload: 'oops' });
    const next = fillReducer(withError, { type: FillActionType.SET_SUBMIT_ERROR, payload: null });
    expect(next.submitError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MARK_SUBMITTED
// ---------------------------------------------------------------------------

describe('fillReducer — MARK_SUBMITTED', () => {
  it('sets submitted to true', () => {
    const state = makeState(makeTemplate([]));
    const next = fillReducer(state, { type: FillActionType.MARK_SUBMITTED });
    expect(next.submitted).toBe(true);
  });

  it('clears all field errors on submit', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = makeState(template);
    const withErrors = fillReducer(state, { type: FillActionType.SET_ERRORS, payload: new Map([['f1', 'err']]) });
    const next = fillReducer(withErrors, { type: FillActionType.MARK_SUBMITTED });
    expect(next.errors.size).toBe(0);
  });

  it('clears submitError on submit', () => {
    const state = makeState(makeTemplate([]));
    const withError = fillReducer(state, { type: FillActionType.SET_SUBMIT_ERROR, payload: 'prev error' });
    const next = fillReducer(withError, { type: FillActionType.MARK_SUBMITTED });
    expect(next.submitError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RESET
// ---------------------------------------------------------------------------

describe('fillReducer — RESET', () => {
  it('resets the form to its initial state', () => {
    const template = makeTemplate([makeTextField('f1')]);
    const state = makeState(template);
    const modified = fillReducer(state, { type: FillActionType.SET_ANSWER, payload: { fieldId: 'f1', value: 'some value' } });
    const submitted = fillReducer(modified, { type: FillActionType.MARK_SUBMITTED });
    expect(submitted.submitted).toBe(true);

    const reset = fillReducer(submitted, { type: FillActionType.RESET });
    expect(reset.submitted).toBe(false);
    expect(reset.answers.get('f1')).toBeUndefined();
    expect(reset.errors.size).toBe(0);
    expect(reset.submitError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// LOAD_DRAFT
// ---------------------------------------------------------------------------

describe('fillReducer — LOAD_DRAFT', () => {
  it('loads draft answers and re-evaluates visibility', () => {
    const f1 = makeTextField('f1');
    const template = makeTemplate([f1]);
    const state = makeState(template);

    const draft = new Map<string, FieldValue>([['f1', 'draft-value']]);
    const next = fillReducer(state, { type: FillActionType.LOAD_DRAFT, payload: draft });

    expect(next.answers.get('f1')).toBe('draft-value');
  });

  it('clears field errors when a draft is loaded', () => {
    const f1 = makeTextField('f1');
    const template = makeTemplate([f1]);
    const state = makeState(template);
    const withErrors = fillReducer(state, { type: FillActionType.SET_ERRORS, payload: new Map([['f1', 'err']]) });

    const draft = new Map<string, FieldValue>([['f1', 'loaded']]);
    const next = fillReducer(withErrors, { type: FillActionType.LOAD_DRAFT, payload: draft });
    expect(next.errors.size).toBe(0);
  });
});
