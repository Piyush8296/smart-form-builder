import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { listTemplates, getTemplate, saveTemplate, deleteTemplate } from './templateStore';
import { TEMPLATES_KEY, templateKey } from './keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import { FieldKind } from '../enums';
import type { FieldConfig } from '../types/fields';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTemplate(id: string, title = 'Test Form', fields: FieldConfig[] = []): Template {
  const now = new Date().toISOString();
  return {
    id,
    title,
    description: '',
    fields,
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

function makeSectionHeader(id: string): FieldConfig {
  return {
    id,
    kind: FieldKind.SECTION_HEADER,
    label: 'Section',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    size: 'md' as never,
  };
}

function makeTextField(id: string): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label: 'Field',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  } as FieldConfig;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('templateStore', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  describe('listTemplates', () => {
    it('returns an empty array when no templates are stored', () => {
      expect(listTemplates()).toEqual([]);
    });

    it('returns summaries from localStorage', () => {
      const summaries = [{ id: 't1', title: 'Form A', fieldCount: 2, updatedAt: new Date().toISOString() }];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(summaries));
      expect(listTemplates()).toHaveLength(1);
      expect(listTemplates()[0].id).toBe('t1');
    });

    it('returns empty array when JSON is corrupted', () => {
      localStorage.setItem(TEMPLATES_KEY, 'not-valid-json{{{');
      expect(listTemplates()).toEqual([]);
    });
  });

  describe('getTemplate', () => {
    it('returns null when template does not exist', () => {
      expect(getTemplate('nonexistent')).toBeNull();
    });

    it('retrieves a stored template by id', () => {
      const t = makeTemplate('t1', 'My Form');
      localStorage.setItem(templateKey('t1'), JSON.stringify(t));
      const loaded = getTemplate('t1');
      expect(loaded?.title).toBe('My Form');
    });

    it('returns null when stored JSON is corrupted', () => {
      localStorage.setItem(templateKey('bad'), '{invalid}');
      expect(getTemplate('bad')).toBeNull();
    });
  });

  describe('saveTemplate', () => {
    it('persists the template to localStorage', () => {
      const t = makeTemplate('t1', 'Saved Form');
      saveTemplate(t);
      const raw = localStorage.getItem(templateKey('t1'));
      expect(raw).not.toBeNull();
      const loaded = JSON.parse(raw!);
      expect(loaded.title).toBe('Saved Form');
    });

    it('adds a summary entry to the index for non-draft templates', () => {
      const t = makeTemplate('t1', 'Public Form');
      saveTemplate(t);
      const summaries = listTemplates();
      expect(summaries).toHaveLength(1);
      expect(summaries[0].id).toBe('t1');
    });

    it('does not add a summary when the template isDraft', () => {
      const t = { ...makeTemplate('t1'), isDraft: true };
      saveTemplate(t);
      expect(listTemplates()).toHaveLength(0);
      // But the raw template data is still stored
      expect(localStorage.getItem(templateKey('t1'))).not.toBeNull();
    });

    it('updates an existing summary entry', () => {
      const t = makeTemplate('t1', 'Original');
      saveTemplate(t);
      expect(listTemplates()[0].title).toBe('Original');

      saveTemplate({ ...t, title: 'Updated' });
      const summaries = listTemplates();
      expect(summaries).toHaveLength(1);
      expect(summaries[0].title).toBe('Updated');
    });

    it('prepends new templates to the summary list', () => {
      saveTemplate(makeTemplate('t1', 'First'));
      saveTemplate(makeTemplate('t2', 'Second'));
      const summaries = listTemplates();
      expect(summaries[0].id).toBe('t2');
      expect(summaries[1].id).toBe('t1');
    });

    it('fieldCount excludes SECTION_HEADER fields', () => {
      const fields: FieldConfig[] = [makeTextField('f1'), makeTextField('f2'), makeSectionHeader('s1')];
      const t = makeTemplate('t1', 'Form', fields);
      saveTemplate(t);
      expect(listTemplates()[0].fieldCount).toBe(2);
    });

    it('throws a readable error when QuotaExceededError is thrown', () => {
      const quotaError = new DOMException('quota exceeded', 'QuotaExceededError');
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw quotaError; });
      expect(() => saveTemplate(makeTemplate('t1'))).toThrowError(/quota exceeded/i);
    });
  });

  describe('deleteTemplate', () => {
    it('removes the template from localStorage', () => {
      saveTemplate(makeTemplate('t1'));
      deleteTemplate('t1');
      expect(localStorage.getItem(templateKey('t1'))).toBeNull();
    });

    it('removes the template from the summary index', () => {
      saveTemplate(makeTemplate('t1'));
      saveTemplate(makeTemplate('t2'));
      deleteTemplate('t1');
      const summaries = listTemplates();
      expect(summaries).toHaveLength(1);
      expect(summaries[0].id).toBe('t2');
    });

    it('is a no-op when the template does not exist', () => {
      saveTemplate(makeTemplate('t1'));
      deleteTemplate('nonexistent');
      expect(listTemplates()).toHaveLength(1);
    });
  });
});
