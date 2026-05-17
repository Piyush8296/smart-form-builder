import type { Template, TemplateSettings } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { generateId } from '../utils/id';
import { BuilderActionType } from '../enums';

export interface EditorState {
  template: Template;
  selectedFieldId: string | null;
  hasUnsavedChanges: boolean;
}

export type EditorAction =
  | { type: BuilderActionType.ADD_FIELD; payload: FieldConfig }
  | { type: BuilderActionType.REMOVE_FIELD; payload: string }
  | { type: BuilderActionType.UPDATE_FIELD; payload: FieldConfig }
  | { type: BuilderActionType.MOVE_FIELD; payload: { from: number; to: number } }
  | { type: BuilderActionType.SELECT_FIELD; payload: string | null }
  | { type: BuilderActionType.DUPLICATE_FIELD; payload: string }
  | { type: BuilderActionType.UPDATE_SETTINGS; payload: Partial<TemplateSettings> }
  | { type: BuilderActionType.SET_TITLE; payload: string }
  | { type: BuilderActionType.MARK_SAVED };

export function builderReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case BuilderActionType.ADD_FIELD: {
      const fields = [...state.template.fields, action.payload];
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: action.payload.id, hasUnsavedChanges: true };
    }
    case BuilderActionType.REMOVE_FIELD: {
      const fields = state.template.fields.filter((f) => f.id !== action.payload);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: state.selectedFieldId === action.payload ? null : state.selectedFieldId, hasUnsavedChanges: true };
    }
    case BuilderActionType.UPDATE_FIELD: {
      const fields = state.template.fields.map((f) => f.id === action.payload.id ? action.payload : f);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true };
    }
    case BuilderActionType.MOVE_FIELD: {
      const fields = [...state.template.fields];
      const [moved] = fields.splice(action.payload.from, 1);
      fields.splice(action.payload.to, 0, moved);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true };
    }
    case BuilderActionType.SELECT_FIELD:
      return { ...state, selectedFieldId: action.payload };
    case BuilderActionType.DUPLICATE_FIELD: {
      const orig = state.template.fields.find((f) => f.id === action.payload);
      if (!orig) return state;
      const clone: FieldConfig = { ...orig, id: generateId(), conditions: [] } as FieldConfig;
      const idx = state.template.fields.findIndex((f) => f.id === action.payload);
      const fields = [...state.template.fields];
      fields.splice(idx + 1, 0, clone);
      return { ...state, template: { ...state.template, fields, updatedAt: new Date().toISOString() }, selectedFieldId: clone.id, hasUnsavedChanges: true };
    }
    case BuilderActionType.UPDATE_SETTINGS:
      return { ...state, template: { ...state.template, settings: { ...state.template.settings, ...action.payload }, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true };
    case BuilderActionType.SET_TITLE:
      return { ...state, template: { ...state.template, title: action.payload, updatedAt: new Date().toISOString() }, hasUnsavedChanges: true };
    case BuilderActionType.MARK_SAVED:
      return { ...state, hasUnsavedChanges: false };
    default:
      return state;
  }
}
