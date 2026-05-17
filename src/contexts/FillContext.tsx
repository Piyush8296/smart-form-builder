import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Template } from '../types/template';
import type { Instance } from '../types/instance';
import { validateAll } from '../logic/validationEngine';
import { saveInstance, saveDraft, clearDraft } from '../storage/instanceStore';
import { generateId } from '../utils/id';
import { FillActionType } from '../enums';
import { fillReducer, buildInitialState, type FillState, type FillAction } from '../state/fillReducer';

interface FillContextValue {
  state: FillState;
  dispatch: React.Dispatch<FillAction>;
  submit: () => void;
}

const FillContext = createContext<FillContextValue | null>(null);

interface FillProviderProps {
  template: Template;
  children: ReactNode;
}

export function FillProvider({ template, children }: FillProviderProps) {
  const [state, dispatch] = useReducer(fillReducer, template, buildInitialState);

  useEffect(() => {
    if (!template.settings.autoSaveDraft || state.submitted) return;
    saveDraft(template.id, state.answers);
  }, [state.answers, state.submitted, template.id, template.settings.autoSaveDraft]);

  function submit() {
    const errors = validateAll(state.template.fields, state.answers, state.visibilityMap);
    if (errors.size > 0) {
      dispatch({ type: FillActionType.SET_ERRORS, payload: errors });
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
        type: FillActionType.SET_SUBMIT_ERROR,
        payload: e instanceof Error ? e.message : 'Failed to save response.',
      });
      return;
    }

    clearDraft(template.id);
    dispatch({ type: FillActionType.MARK_SUBMITTED });
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
