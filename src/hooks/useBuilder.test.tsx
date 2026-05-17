import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { useBuilder } from './useBuilder';
import { BuilderProvider } from '../contexts/BuilderContext';
import { FieldKind } from '../enums';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { templateKey, TEMPLATES_KEY } from '../storage/keys';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: 'tmpl-builder-1',
    title: 'Builder Test',
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeTextField(id: string, label = 'A Field'): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  } as FieldConfig;
}

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function makeWrapper(template: Template) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(BuilderProvider, { template, children });
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useBuilder', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('exposes the template from the provider', () => {
      const template = makeTemplate({ title: 'My Form' });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });
      expect(result.current.template.title).toBe('My Form');
    });

    it('starts with no selected field', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });
      expect(result.current.selectedFieldId).toBeNull();
      expect(result.current.selectedField).toBeNull();
    });

    it('starts with hasUnsavedChanges false', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('exposes an empty fields array when the template has no fields', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });
      expect(result.current.fields).toHaveLength(0);
    });
  });

  describe('addField', () => {
    it('adds a field of the given kind to the template', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });

      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });

      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].kind).toBe(FieldKind.TEXT_SINGLE);
    });

    it('selects the newly added field', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });

      act(() => { result.current.addField(FieldKind.NUMBER); });

      const addedId = result.current.fields[0].id;
      expect(result.current.selectedFieldId).toBe(addedId);
    });

    it('marks hasUnsavedChanges after adding', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });

      act(() => { result.current.addField(FieldKind.EMAIL); });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('each added field gets a unique id', () => {
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(makeTemplate()) });

      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });
      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });

      const ids = result.current.fields.map((f) => f.id);
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe('removeField', () => {
    it('removes the field with the given id', () => {
      const template = makeTemplate({ fields: [makeTextField('f1'), makeTextField('f2')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.removeField('f1'); });

      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].id).toBe('f2');
    });

    it('deselects the field when it is removed', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.selectField('f1'); });
      act(() => { result.current.removeField('f1'); });

      expect(result.current.selectedFieldId).toBeNull();
    });

    it('marks hasUnsavedChanges after removing', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.removeField('f1'); });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('updateField', () => {
    it('replaces the field with the updated version', () => {
      const field = makeTextField('f1', 'Original');
      const template = makeTemplate({ fields: [field] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.updateField({ ...field, label: 'Updated' }); });

      expect(result.current.fields[0].label).toBe('Updated');
    });

    it('marks hasUnsavedChanges after updating', () => {
      const field = makeTextField('f1');
      const template = makeTemplate({ fields: [field] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.updateField({ ...field, label: 'New Label' }); });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('moveField', () => {
    it('reorders fields from the given index to the target index', () => {
      const template = makeTemplate({
        fields: [makeTextField('f1'), makeTextField('f2'), makeTextField('f3')],
      });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.moveField(0, 2); });

      expect(result.current.fields.map((f) => f.id)).toEqual(['f2', 'f3', 'f1']);
    });

    it('marks hasUnsavedChanges after moving', () => {
      const template = makeTemplate({ fields: [makeTextField('f1'), makeTextField('f2')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.moveField(0, 1); });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('selectField', () => {
    it('sets selectedFieldId to the given id', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.selectField('f1'); });

      expect(result.current.selectedFieldId).toBe('f1');
    });

    it('resolves selectedField to the actual field object', () => {
      const field = makeTextField('f1', 'Target Field');
      const template = makeTemplate({ fields: [field] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.selectField('f1'); });

      expect(result.current.selectedField?.label).toBe('Target Field');
    });

    it('deselects when null is passed', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.selectField('f1'); });
      act(() => { result.current.selectField(null); });

      expect(result.current.selectedFieldId).toBeNull();
      expect(result.current.selectedField).toBeNull();
    });

    it('does not mark hasUnsavedChanges', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.selectField('f1'); });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('duplicateField', () => {
    it('inserts a clone immediately after the original', () => {
      const template = makeTemplate({ fields: [makeTextField('f1'), makeTextField('f2')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.duplicateField('f1'); });

      expect(result.current.fields).toHaveLength(3);
      expect(result.current.fields[0].id).toBe('f1');
      expect(result.current.fields[2].id).toBe('f2');
    });

    it('assigns a new id to the clone', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.duplicateField('f1'); });

      expect(result.current.fields[1].id).not.toBe('f1');
    });

    it('marks hasUnsavedChanges after duplicating', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.duplicateField('f1'); });

      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });

  describe('autosave side effect', () => {
    it('persists the template to localStorage when hasUnsavedChanges becomes true', () => {
      const template = makeTemplate({ id: 'tmpl-autosave' });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });

      const stored = localStorage.getItem(templateKey('tmpl-autosave'));
      expect(stored).not.toBeNull();
    });

    it('strips isDraft when the first real modification is made', () => {
      const template = makeTemplate({ id: 'tmpl-draft', isDraft: true });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });

      const stored = localStorage.getItem(templateKey('tmpl-draft'));
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.isDraft).toBeUndefined();
    });

    it('does not write to localStorage before any changes occur', () => {
      const template = makeTemplate({ id: 'tmpl-clean' });
      renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      expect(localStorage.getItem(templateKey('tmpl-clean'))).toBeNull();
    });

    it('adds a summary entry to the template index after a change', () => {
      const template = makeTemplate({ id: 'tmpl-index' });
      const { result } = renderHook(() => useBuilder(), { wrapper: makeWrapper(template) });

      act(() => { result.current.addField(FieldKind.TEXT_SINGLE); });

      const index = JSON.parse(localStorage.getItem(TEMPLATES_KEY) ?? '[]') as Array<{ id: string }>;
      expect(index.some((s) => s.id === 'tmpl-index')).toBe(true);
    });
  });
});
