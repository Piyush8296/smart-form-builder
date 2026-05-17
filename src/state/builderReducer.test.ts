import { describe, it, expect } from 'vitest';
import { builderReducer, type EditorState } from './builderReducer';
import { BuilderActionType, FieldKind } from '../enums';
import type { FieldConfig } from '../types/fields';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTextField(id: string, label = 'Field'): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  } as FieldConfig;
}

function makeTemplate(fields: FieldConfig[] = []): Template {
  const now = new Date().toISOString();
  return {
    id: 'tmpl-1',
    title: 'Test Template',
    description: '',
    fields,
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

function makeState(overrides: Partial<EditorState> = {}): EditorState {
  return {
    template: makeTemplate(),
    selectedFieldId: null,
    hasUnsavedChanges: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('builderReducer', () => {
  describe('ADD_FIELD', () => {
    it('appends the new field to the template fields', () => {
      const state = makeState();
      const field = makeTextField('f1', 'New Field');
      const next = builderReducer(state, { type: BuilderActionType.ADD_FIELD, payload: field });
      expect(next.template.fields).toHaveLength(1);
      expect(next.template.fields[0].id).toBe('f1');
    });

    it('selects the newly added field', () => {
      const state = makeState();
      const field = makeTextField('f1');
      const next = builderReducer(state, { type: BuilderActionType.ADD_FIELD, payload: field });
      expect(next.selectedFieldId).toBe('f1');
    });

    it('marks unsaved changes', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.ADD_FIELD, payload: makeTextField('f1') });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('REMOVE_FIELD', () => {
    it('removes the field with the given id', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1'), makeTextField('f2')]) });
      const next = builderReducer(state, { type: BuilderActionType.REMOVE_FIELD, payload: 'f1' });
      expect(next.template.fields).toHaveLength(1);
      expect(next.template.fields[0].id).toBe('f2');
    });

    it('clears selectedFieldId when the selected field is removed', () => {
      const state = makeState({
        template: makeTemplate([makeTextField('f1')]),
        selectedFieldId: 'f1',
      });
      const next = builderReducer(state, { type: BuilderActionType.REMOVE_FIELD, payload: 'f1' });
      expect(next.selectedFieldId).toBeNull();
    });

    it('preserves selectedFieldId when a different field is removed', () => {
      const state = makeState({
        template: makeTemplate([makeTextField('f1'), makeTextField('f2')]),
        selectedFieldId: 'f2',
      });
      const next = builderReducer(state, { type: BuilderActionType.REMOVE_FIELD, payload: 'f1' });
      expect(next.selectedFieldId).toBe('f2');
    });

    it('marks unsaved changes', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1')]) });
      const next = builderReducer(state, { type: BuilderActionType.REMOVE_FIELD, payload: 'f1' });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('UPDATE_FIELD', () => {
    it('replaces the field with the updated version', () => {
      const original = makeTextField('f1', 'Original');
      const state = makeState({ template: makeTemplate([original]) });
      const updated = { ...original, label: 'Updated' };
      const next = builderReducer(state, { type: BuilderActionType.UPDATE_FIELD, payload: updated });
      expect(next.template.fields[0].label).toBe('Updated');
    });

    it('does not affect other fields', () => {
      const f1 = makeTextField('f1', 'F1');
      const f2 = makeTextField('f2', 'F2');
      const state = makeState({ template: makeTemplate([f1, f2]) });
      const next = builderReducer(state, { type: BuilderActionType.UPDATE_FIELD, payload: { ...f1, label: 'Updated F1' } });
      expect(next.template.fields[1].label).toBe('F2');
    });

    it('marks unsaved changes', () => {
      const f1 = makeTextField('f1');
      const state = makeState({ template: makeTemplate([f1]) });
      const next = builderReducer(state, { type: BuilderActionType.UPDATE_FIELD, payload: f1 });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('MOVE_FIELD', () => {
    it('moves a field from one index to another', () => {
      const fields = [makeTextField('f1'), makeTextField('f2'), makeTextField('f3')];
      const state = makeState({ template: makeTemplate(fields) });
      // Move f1 (index 0) to index 2
      const next = builderReducer(state, { type: BuilderActionType.MOVE_FIELD, payload: { from: 0, to: 2 } });
      expect(next.template.fields.map((f) => f.id)).toEqual(['f2', 'f3', 'f1']);
    });

    it('moving a field to the same index is a no-op in terms of order', () => {
      const fields = [makeTextField('f1'), makeTextField('f2')];
      const state = makeState({ template: makeTemplate(fields) });
      const next = builderReducer(state, { type: BuilderActionType.MOVE_FIELD, payload: { from: 0, to: 0 } });
      expect(next.template.fields.map((f) => f.id)).toEqual(['f1', 'f2']);
    });

    it('marks unsaved changes', () => {
      const fields = [makeTextField('f1'), makeTextField('f2')];
      const state = makeState({ template: makeTemplate(fields) });
      const next = builderReducer(state, { type: BuilderActionType.MOVE_FIELD, payload: { from: 0, to: 1 } });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('SELECT_FIELD', () => {
    it('sets selectedFieldId to the given id', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.SELECT_FIELD, payload: 'f1' });
      expect(next.selectedFieldId).toBe('f1');
    });

    it('sets selectedFieldId to null to deselect', () => {
      const state = makeState({ selectedFieldId: 'f1' });
      const next = builderReducer(state, { type: BuilderActionType.SELECT_FIELD, payload: null });
      expect(next.selectedFieldId).toBeNull();
    });

    it('does not mark unsaved changes', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.SELECT_FIELD, payload: 'f1' });
      expect(next.hasUnsavedChanges).toBe(false);
    });
  });

  describe('DUPLICATE_FIELD', () => {
    it('inserts a clone immediately after the original', () => {
      const fields = [makeTextField('f1'), makeTextField('f2')];
      const state = makeState({ template: makeTemplate(fields) });
      const next = builderReducer(state, { type: BuilderActionType.DUPLICATE_FIELD, payload: 'f1' });
      expect(next.template.fields).toHaveLength(3);
      expect(next.template.fields[0].id).toBe('f1');
      // Clone is at index 1
      const clone = next.template.fields[1];
      expect(clone.id).not.toBe('f1');
      expect(next.template.fields[2].id).toBe('f2');
    });

    it('the cloned field has an empty conditions array', () => {
      const field = { ...makeTextField('f1'), conditions: [{ id: 'c1', targetFieldId: 'x', operator: 'equals' as never, value: 'y', effect: 'show' as never }] } as FieldConfig;
      const state = makeState({ template: makeTemplate([field]) });
      const next = builderReducer(state, { type: BuilderActionType.DUPLICATE_FIELD, payload: 'f1' });
      expect(next.template.fields[1].conditions).toHaveLength(0);
    });

    it('selects the cloned field', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1')]) });
      const next = builderReducer(state, { type: BuilderActionType.DUPLICATE_FIELD, payload: 'f1' });
      const cloneId = next.template.fields[1].id;
      expect(next.selectedFieldId).toBe(cloneId);
    });

    it('is a no-op when the field does not exist', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1')]) });
      const next = builderReducer(state, { type: BuilderActionType.DUPLICATE_FIELD, payload: 'nonexistent' });
      expect(next.template.fields).toHaveLength(1);
      expect(next).toStrictEqual(state);
    });

    it('marks unsaved changes', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1')]) });
      const next = builderReducer(state, { type: BuilderActionType.DUPLICATE_FIELD, payload: 'f1' });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('UPDATE_SETTINGS', () => {
    it('merges the partial settings into existing settings', () => {
      const state = makeState();
      const next = builderReducer(state, {
        type: BuilderActionType.UPDATE_SETTINGS,
        payload: { showProgressBar: true },
      });
      expect(next.template.settings.showProgressBar).toBe(true);
    });

    it('does not clobber other settings keys', () => {
      const state = makeState();
      const originalKeys = Object.keys(state.template.settings);
      const next = builderReducer(state, {
        type: BuilderActionType.UPDATE_SETTINGS,
        payload: { showProgressBar: true },
      });
      // All original keys still exist
      for (const key of originalKeys) {
        expect(next.template.settings).toHaveProperty(key);
      }
    });

    it('marks unsaved changes', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.UPDATE_SETTINGS, payload: {} });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('SET_TITLE', () => {
    it('updates the template title', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.SET_TITLE, payload: 'New Title' });
      expect(next.template.title).toBe('New Title');
    });

    it('marks unsaved changes', () => {
      const state = makeState();
      const next = builderReducer(state, { type: BuilderActionType.SET_TITLE, payload: 'X' });
      expect(next.hasUnsavedChanges).toBe(true);
    });
  });

  describe('MARK_SAVED', () => {
    it('clears hasUnsavedChanges', () => {
      const state = makeState({ hasUnsavedChanges: true });
      const next = builderReducer(state, { type: BuilderActionType.MARK_SAVED });
      expect(next.hasUnsavedChanges).toBe(false);
    });

    it('does not affect other state', () => {
      const state = makeState({ selectedFieldId: 'f1', hasUnsavedChanges: true });
      const next = builderReducer(state, { type: BuilderActionType.MARK_SAVED });
      expect(next.selectedFieldId).toBe('f1');
    });
  });

  describe('immutability', () => {
    it('never mutates the original state object', () => {
      const state = makeState({ template: makeTemplate([makeTextField('f1')]) });
      const frozen = Object.freeze(state);
      // Should not throw
      const next = builderReducer(frozen, { type: BuilderActionType.REMOVE_FIELD, payload: 'f1' });
      expect(next).not.toBe(state);
    });
  });
});
