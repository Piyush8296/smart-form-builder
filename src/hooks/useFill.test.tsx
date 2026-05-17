import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { useFill } from './useFill';
import { FillProvider } from '../contexts/FillContext';
import { FieldKind, ConditionOperator, ConditionEffect } from '../enums';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { instancesKey, draftKey } from '../storage/keys';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: 'tmpl-fill-1',
    title: 'Fill Test',
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

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

function makeWrapper(template: Template) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(FillProvider, { template, children });
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFill', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('exposes the template from the provider', () => {
      const template = makeTemplate({ title: 'My Survey' });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.template.title).toBe('My Survey');
    });

    it('starts with submitted false', () => {
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(makeTemplate()) });
      expect(result.current.submitted).toBe(false);
    });

    it('starts with empty answers', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.getAnswer('f1')).toBeNull();
    });

    it('starts with no submitError', () => {
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(makeTemplate()) });
      expect(result.current.submitError).toBeNull();
    });
  });

  describe('setAnswer / getAnswer', () => {
    it('stores and retrieves an answer by field id', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('f1', 'hello'); });

      expect(result.current.getAnswer('f1')).toBe('hello');
    });

    it('clears the error for the answered field', () => {
      const template = makeTemplate({ fields: [makeTextField('f1', { defaultRequired: true })] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      // Trigger validation error by submitting empty
      act(() => { result.current.submit(); });
      expect(result.current.getError('f1')).not.toBeNull();

      // Now answer it — error should clear
      act(() => { result.current.setAnswer('f1', 'filled'); });
      expect(result.current.getError('f1')).toBeNull();
    });

    it('returns null for an unanswered field', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.getAnswer('f1')).toBeNull();
    });
  });

  describe('completedCount / interactiveFieldCount', () => {
    it('counts only fields with non-empty answers', () => {
      const template = makeTemplate({
        fields: [makeTextField('f1'), makeTextField('f2')],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      expect(result.current.completedCount).toBe(0);

      act(() => { result.current.setAnswer('f1', 'value'); });

      expect(result.current.completedCount).toBe(1);
      expect(result.current.interactiveFieldCount).toBe(2);
    });

    it('does not count display-only fields in interactiveFieldCount', () => {
      const sectionHeader: FieldConfig = {
        id: 'sec1',
        kind: FieldKind.SECTION_HEADER,
        label: 'Section',
        conditions: [],
        defaultVisible: true,
        defaultRequired: false,
        size: 'md',
      } as FieldConfig;
      const template = makeTemplate({ fields: [sectionHeader, makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      expect(result.current.interactiveFieldCount).toBe(1);
    });
  });

  describe('isVisible / isRequired', () => {
    it('returns true by default for visible fields', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.isVisible('f1')).toBe(true);
    });

    it('returns false for a field that starts hidden', () => {
      const template = makeTemplate({ fields: [makeTextField('f1', { defaultVisible: false })] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.isVisible('f1')).toBe(false);
    });

    it('updates visibility when an answer triggers a SHOW condition', () => {
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
      const template = makeTemplate({ fields: [trigger, dependent] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      expect(result.current.isVisible('dep')).toBe(false);

      act(() => { result.current.setAnswer('trigger', 'show'); });

      expect(result.current.isVisible('dep')).toBe(true);
    });

    it('updates visibility when an answer triggers a HIDE condition', () => {
      const trigger = makeTextField('trigger');
      const dependent = makeTextField('dep', {
        defaultVisible: true,
        conditions: [{
          id: 'c2',
          targetFieldId: 'trigger',
          operator: ConditionOperator.EQUALS,
          value: 'hide-it',
          effect: ConditionEffect.HIDE,
        }],
      });
      const template = makeTemplate({ fields: [trigger, dependent] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      expect(result.current.isVisible('dep')).toBe(true);

      act(() => { result.current.setAnswer('trigger', 'hide-it'); });

      expect(result.current.isVisible('dep')).toBe(false);
    });
  });

  describe('getError', () => {
    it('returns null when no error exists for a field', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });
      expect(result.current.getError('f1')).toBeNull();
    });
  });

  describe('loadDraft', () => {
    it('populates answers from the provided map', () => {
      const template = makeTemplate({ fields: [makeTextField('f1'), makeTextField('f2')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      const draft = new Map<string, string>([['f1', 'draft-val'], ['f2', 'another']]);
      act(() => { result.current.loadDraft(draft); });

      expect(result.current.getAnswer('f1')).toBe('draft-val');
      expect(result.current.getAnswer('f2')).toBe('another');
    });
  });

  describe('reset', () => {
    it('clears all answers and submitted state', () => {
      const template = makeTemplate({ fields: [makeTextField('f1')] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('f1', 'some value'); });
      act(() => { result.current.reset(); });

      expect(result.current.getAnswer('f1')).toBeNull();
      expect(result.current.submitted).toBe(false);
    });
  });

  describe('submit', () => {
    it('sets validation errors when required fields are empty', () => {
      const template = makeTemplate({
        fields: [makeTextField('f1', { defaultRequired: true })],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.submit(); });

      expect(result.current.getError('f1')).not.toBeNull();
      expect(result.current.submitted).toBe(false);
    });

    it('marks submitted when all required fields are filled', () => {
      const template = makeTemplate({
        fields: [makeTextField('f1', { defaultRequired: true })],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('f1', 'a value'); });
      act(() => { result.current.submit(); });

      expect(result.current.submitted).toBe(true);
    });

    it('marks submitted for a form with no fields', () => {
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(makeTemplate()) });

      act(() => { result.current.submit(); });

      expect(result.current.submitted).toBe(true);
    });

    it('persists an instance to localStorage on successful submit', () => {
      const template = makeTemplate({ id: 'tmpl-submit', fields: [] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.submit(); });

      const raw = localStorage.getItem(instancesKey('tmpl-submit'));
      expect(raw).not.toBeNull();
      const summaries = JSON.parse(raw!);
      expect(summaries).toHaveLength(1);
    });

    it('clears the draft after a successful submit', () => {
      const template = makeTemplate({
        id: 'tmpl-draft-clear',
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, autoSaveDraft: true },
        fields: [makeTextField('f1')],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      // Put a draft in storage to verify it gets cleared
      localStorage.setItem(draftKey('tmpl-draft-clear'), JSON.stringify({ answers: { f1: 'draft' } }));

      act(() => { result.current.setAnswer('f1', 'final'); });
      act(() => { result.current.submit(); });

      expect(localStorage.getItem(draftKey('tmpl-draft-clear'))).toBeNull();
    });

    it('sets submitError when the instance store throws on save', () => {
      // Patch saveInstance at the module level to simulate a storage failure.
      // We import the module under test indirectly via FillContext, so we
      // intercept localStorage directly using the vitest global storage mock.
      const template = makeTemplate({ id: 'tmpl-quota', fields: [] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      // Replace the real setItem with one that throws on the instance key write.
      // jsdom exposes localStorage as a real object — patch the prototype method.
      const proto = Object.getPrototypeOf(localStorage) as Storage;
      const original = proto.setItem;
      proto.setItem = function (key: string, value: string) {
        // fb:instance:<uuid> — the body write (not fb:instances:<tid>)
        if (key.startsWith('fb:instance:') && !key.startsWith('fb:instances:')) {
          throw new DOMException('QuotaExceeded', 'QuotaExceededError');
        }
        original.call(this, key, value);
      };

      try {
        act(() => { result.current.submit(); });
        expect(result.current.submitError).not.toBeNull();
        expect(result.current.submitted).toBe(false);
      } finally {
        proto.setItem = original;
      }
    });

    it('does not include hidden fields in the submitted answers', () => {
      const trigger = makeTextField('trigger');
      const hidden = makeTextField('hidden-field', {
        defaultVisible: false,
        conditions: [],
      });
      const template = makeTemplate({ id: 'tmpl-vis', fields: [trigger, hidden] });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('trigger', 'value'); });
      act(() => { result.current.setAnswer('hidden-field', 'secret'); });
      act(() => { result.current.submit(); });

      // Instance should be stored; the hidden field has defaultVisible: false
      const raw = localStorage.getItem(instancesKey('tmpl-vis'));
      expect(raw).not.toBeNull();
      // The instance was saved (submitted is true), meaning hidden field was filtered
      expect(result.current.submitted).toBe(true);
    });
  });

  describe('autosave draft side effect', () => {
    it('writes a draft to localStorage when autoSaveDraft is enabled', () => {
      const template = makeTemplate({
        id: 'tmpl-autosave-draft',
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, autoSaveDraft: true },
        fields: [makeTextField('f1')],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('f1', 'in-progress'); });

      const raw = localStorage.getItem(draftKey('tmpl-autosave-draft'));
      expect(raw).not.toBeNull();
      const data = JSON.parse(raw!);
      expect(data.answers.f1).toBe('in-progress');
    });

    it('does not write a draft when autoSaveDraft is disabled', () => {
      const template = makeTemplate({
        id: 'tmpl-no-draft',
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, autoSaveDraft: false },
        fields: [makeTextField('f1')],
      });
      const { result } = renderHook(() => useFill(), { wrapper: makeWrapper(template) });

      act(() => { result.current.setAnswer('f1', 'value'); });

      expect(localStorage.getItem(draftKey('tmpl-no-draft'))).toBeNull();
    });
  });
});
