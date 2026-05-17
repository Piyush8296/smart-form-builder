import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Template } from '../types/template';
import { saveTemplate } from '../storage/templateStore';
import { builderReducer, type EditorState, type EditorAction } from '../state/builderReducer';

interface BuilderContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorAction>;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

interface BuilderProviderProps {
  template: Template;
  children: ReactNode;
}

export function BuilderProvider({ template, children }: BuilderProviderProps) {
  const [state, dispatch] = useReducer(builderReducer, { template, selectedFieldId: null, hasUnsavedChanges: false });

  useEffect(() => {
    if (!state.hasUnsavedChanges) return;
    // Strip isDraft so template enters the summary index on first real modification.
    const t = state.template.isDraft ? { ...state.template, isDraft: undefined } : state.template;
    try { saveTemplate(t); } catch { /* quota error surfaced elsewhere */ }
  }, [state.template, state.hasUnsavedChanges]);

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuildContext(): BuilderContextValue {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuildContext must be used inside BuilderProvider');
  return ctx;
}
