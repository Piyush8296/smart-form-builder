import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Template } from '../types/template';
import type { FieldConfig, FieldValue } from '../types/fields';
import type { FieldVisibilityState } from '../types/conditions';
import type { Instance } from '../types/instance';
import { evaluateAllFields } from '../logic/conditionEvaluator';
import { computeCalculation } from '../logic/calculationEngine';
import { validateAll } from '../logic/validationEngine';
import { saveInstance, saveDraft, clearDraft } from '../storage/instanceStore';
import { generateId } from '../utils/id';

interface FillState {
  template: Template;
  answers: Map<string, FieldValue>;
  visibilityMap: Map<string, FieldVisibilityState>;
  errors: Map<string, string>;
  submitted: boolean;
  submitError: string | null;
}

type FillAction =
  | { type: 'SET_ANSWER'; payload: { fieldId: string; value: FieldValue } }
  | { type: 'SET_ERRORS'; payload: Map<string, string> }
  | { type: 'SET_SUBMIT_ERROR'; payload: string | null }
  | { type: 'MARK_SUBMITTED' }
  | { type: 'RESET' }
  | { type: 'LOAD_DRAFT'; payload: Map<string, FieldValue> };

interface FillContextValue {
  state: FillState;
  dispatch: React.Dispatch<FillAction>;
  submit: () => void;
}

function buildInitialAnswers(fields: FieldConfig[]): Map<string, FieldValue> {
  const answers = new Map<string, FieldValue>();
  for (const field of fields) {
    if ('defaultValue' in field && field.defaultValue !== undefined) {
      answers.set(field.id, field.defaultValue as FieldValue);
    }
  }
  return answers;
}

function applyCalculations(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): Map<string, FieldValue> {
  const updated = new Map(answers);
  for (const field of fields) {
    if (field.kind === 'calculation') {
      const result = computeCalculation(field, fields, updated, visibilityMap);
      updated.set(field.id, result);
    }
  }
  return updated;
}

function clearHiddenAnswers(
  answers: Map<string, FieldValue>,
  visibilityMap: Map<string, FieldVisibilityState>,
): Map<string, FieldValue> {
  const updated = new Map(answers);
  for (const [fieldId, state] of visibilityMap) {
    if (!state.visible) updated.set(fieldId, null);
  }
  return updated;
}

function recomputeState(
  fields: FieldConfig[],
  answers: Map<string, FieldValue>,
): { answers: Map<string, FieldValue>; visibilityMap: Map<string, FieldVisibilityState> } {
  const visibilityMap = evaluateAllFields(fields, answers);
  const clearedAnswers = clearHiddenAnswers(answers, visibilityMap);
  const finalAnswers = applyCalculations(fields, clearedAnswers, visibilityMap);
  return { answers: finalAnswers, visibilityMap };
}

function buildInitialState(template: Template): FillState {
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

function reducer(state: FillState, action: FillAction): FillState {
  switch (action.type) {
    case 'SET_ANSWER': {
      const { fieldId, value } = action.payload;
      const rawAnswers = new Map(state.answers);
      rawAnswers.set(fieldId, value);
      const { answers, visibilityMap } = recomputeState(state.template.fields, rawAnswers);
      const errors = new Map(state.errors);
      errors.delete(fieldId);
      return { ...state, answers, visibilityMap, errors };
    }
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.payload };
    case 'MARK_SUBMITTED':
      return { ...state, submitted: true, errors: new Map(), submitError: null };
    case 'RESET':
      return buildInitialState(state.template);
    case 'LOAD_DRAFT': {
      const { answers, visibilityMap } = recomputeState(state.template.fields, action.payload);
      return { ...state, answers, visibilityMap, errors: new Map() };
    }
    default:
      return state;
  }
}

const FillContext = createContext<FillContextValue | null>(null);

interface FillProviderProps {
  template: Template;
  children: ReactNode;
}

export function FillProvider({ template, children }: FillProviderProps) {
  const [state, dispatch] = useReducer(reducer, template, buildInitialState);

  useEffect(() => {
    if (!template.settings.autoSaveDraft || state.submitted) return;
    saveDraft(template.id, state.answers);
  }, [state.answers, state.submitted, template.id, template.settings.autoSaveDraft]);

  function submit() {
    const errors = validateAll(state.template.fields, state.answers, state.visibilityMap);
    if (errors.size > 0) {
      dispatch({ type: 'SET_ERRORS', payload: errors });
      return;
    }

    const answers = Array.from(state.template.fields)
      .filter((f) => {
        const vis = state.visibilityMap.get(f.id);
        return vis?.visible;
      })
      .map((f) => ({
        fieldId: f.id,
        value: state.answers.get(f.id) ?? null,
        fieldSnapshot: f,
      }));

    const instance: Instance = {
      id: generateId(),
      templateId: state.template.id,
      answers,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      saveInstance(instance);
    } catch (e) {
      dispatch({
        type: 'SET_SUBMIT_ERROR',
        payload: e instanceof Error ? e.message : 'Failed to save response.',
      });
      return;
    }

    clearDraft(template.id);
    dispatch({ type: 'MARK_SUBMITTED' });
  }

  return (
    <FillContext.Provider value={{ state, dispatch, submit }}>
      {children}
    </FillContext.Provider>
  );
}

export function useFillContext(): FillContextValue {
  const ctx = useContext(FillContext);
  if (!ctx) throw new Error('useFillContext must be used inside FillProvider');
  return ctx;
}
