import type { Template } from '../types/template';
import type { FieldValue } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';
import { FillActionType } from '../enums';
import { buildInitialAnswers, recomputeState } from '../utils/formState';

export interface FillState {
  template: Template;
  answers: Map<string, FieldValue>;
  visibilityMap: Map<string, FieldVisibilityState>;
  errors: Map<string, string>;
  submitted: boolean;
  submitError: string | null;
}

export type FillAction =
  | { type: FillActionType.SET_ANSWER; payload: { fieldId: string; value: FieldValue } }
  | { type: FillActionType.SET_ERRORS; payload: Map<string, string> }
  | { type: FillActionType.SET_SUBMIT_ERROR; payload: string | null }
  | { type: FillActionType.MARK_SUBMITTED }
  | { type: FillActionType.RESET }
  | { type: FillActionType.LOAD_DRAFT; payload: Map<string, FieldValue> };

export function buildInitialState(template: Template): FillState {
  const rawAnswers = buildInitialAnswers(template.fields);
  const { answers, visibilityMap } = recomputeState(template.fields, rawAnswers);
  return {
    template,
    answers,
    visibilityMap,
    errors: new Map(),
    submitted: false,
    submitError: null,
  };
}

export function fillReducer(state: FillState, action: FillAction): FillState {
  switch (action.type) {
    case FillActionType.SET_ANSWER: {
      const { fieldId, value } = action.payload;
      const rawAnswers = new Map(state.answers);
      rawAnswers.set(fieldId, value);
      const { answers, visibilityMap } = recomputeState(state.template.fields, rawAnswers);
      const errors = new Map(state.errors);
      errors.delete(fieldId);
      return { ...state, answers, visibilityMap, errors };
    }
    case FillActionType.SET_ERRORS:
      return { ...state, errors: action.payload };
    case FillActionType.SET_SUBMIT_ERROR:
      return { ...state, submitError: action.payload };
    case FillActionType.MARK_SUBMITTED:
      return { ...state, submitted: true, errors: new Map(), submitError: null };
    case FillActionType.RESET:
      return buildInitialState(state.template);
    case FillActionType.LOAD_DRAFT: {
      const { answers, visibilityMap } = recomputeState(state.template.fields, action.payload);
      return { ...state, answers, visibilityMap, errors: new Map() };
    }
    default:
      return state;
  }
}
