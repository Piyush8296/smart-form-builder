import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Template, TemplateSettings } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { saveTemplate } from '../storage/templateStore';
import { generateId } from '../utils/id';

interface EditorState {
  template: Template;
  selectedFieldId: string | null;
  isDirty: boolean;
}

type EditorAction =
  | { type: 'ADD_FIELD'; payload: FieldConfig }
  | { type: 'REMOVE_FIELD'; payload: string }
  | { type: 'UPDATE_FIELD'; payload: FieldConfig }
  | { type: 'MOVE_FIELD'; payload: { from: number; to: number } }
  | { type: 'SELECT_FIELD'; payload: string | null }
  | { type: 'DUPLICATE_FIELD'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TemplateSettings> }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'MARK_SAVED' };

function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_FIELD': {
      const fields = [...state.template.fields, action.payload];
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: action.payload.id, isDirty: true };
    }
    case 'REMOVE_FIELD': {
      const fields = state.template.fields.filter((f) => f.id !== action.payload);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId, isDirty: true };
    }
    case 'UPDATE_FIELD': {
      const fields = state.template.fields.map((f) => f.id === action.payload.id ? action.payload : f);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, isDirty: true };
    }
    case 'MOVE_FIELD': {
      const fields = [...state.template.fields];
      const [moved] = fields.splice(action.payload.from, 1);
      fields.splice(action.payload.to, 0, moved);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, isDirty: true };
    }
    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.payload };
    case 'DUPLICATE_FIELD': {
      const orig = state.template.fields.find((f) => f.id === action.payload);
      if (!orig) return state;
      const clone: FieldConfig = { ...orig, id: generateId(), conditions: [] } as FieldConfig;
      const idx = state.template.fields.findIndex((f) => f.id === action.payload);
      const fields = [...state.template.fields];
      fields.splice(idx + 1, 0, clone);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: clone.id, isDirty: true };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, template: { ...state.template, settings: { ...state.template.settings, ...action.payload }, updatedAt: new Date().toISOString() }, isDirty: true };
    case 'SET_TITLE':
      return { ...state, template: { ...state.template, title: action.payload, updatedAt: new Date().toISOString() }, isDirty: true };
    case 'MARK_SAVED':
      return { ...state, isDirty: false };
    default:
      return state;
  }
}

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
  const [state, dispatch] = useReducer(reducer, { template, selectedFieldId: null, isDirty: false });

  useEffect(() => {
    if (!state.isDirty) return;
    // Strip isDraft so template enters the summary index on first real modification.
    const t = state.template.isDraft ? { ...state.template, isDraft: undefined } : state.template;
    try { saveTemplate(t); } catch { /* quota error surfaced elsewhere */ }
  }, [state.template, state.isDirty]);

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
