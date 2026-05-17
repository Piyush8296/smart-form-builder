import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import { useHome } from './useHome';
import { SESSION_KEY, USERS_KEY, TEMPLATES_KEY, templateKey, userTemplatesKey } from '../storage/keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(SessionProvider, null, children),
  );

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = 'user-test-123';

function seedSession() {
  const session = {
    userId: TEST_USER_ID,
    email: 'test@example.com',
    displayName: 'Test User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(USERS_KEY, JSON.stringify({ 'test@example.com': session }));
}

function makeTemplate(id: string, title: string): Template {
  const now = new Date().toISOString();
  return {
    id,
    title,
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

function seedTemplates(templates: Template[]) {
  const summaries = templates.map((t) => ({ id: t.id, title: t.title, fieldCount: 0, updatedAt: t.updatedAt }));
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(summaries));
  for (const t of templates) {
    localStorage.setItem(templateKey(t.id), JSON.stringify(t));
  }
  const ids = templates.map((t) => t.id);
  localStorage.setItem(userTemplatesKey(TEST_USER_ID), JSON.stringify(ids));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useHome', () => {
  beforeEach(() => {
    localStorage.clear();
    seedSession();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('initialises with empty search and no deleteId', () => {
      const { result } = renderHook(() => useHome(), { wrapper });
      expect(result.current.search).toBe('');
      expect(result.current.deleteId).toBeNull();
    });

    it('items always contains the NEW card as the first element', () => {
      const { result } = renderHook(() => useHome(), { wrapper });
      expect(result.current.items[0]).toMatchObject({ kind: 'new' });
    });

    it('loads templates from storage on mount', () => {
      seedTemplates([makeTemplate('t1', 'Alpha'), makeTemplate('t2', 'Beta')]);
      const { result } = renderHook(() => useHome(), { wrapper });
      expect(result.current.templates).toHaveLength(2);
    });
  });

  describe('search filtering', () => {
    it('filters templates by title (case-insensitive)', () => {
      seedTemplates([makeTemplate('t1', 'Alpha Form'), makeTemplate('t2', 'Beta Survey')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      act(() => { result.current.setSearch('alpha'); });

      expect(result.current.filtered).toHaveLength(1);
      expect(result.current.filtered[0].title).toBe('Alpha Form');
    });

    it('returns all templates when search is empty', () => {
      seedTemplates([makeTemplate('t1', 'Alpha'), makeTemplate('t2', 'Beta')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      act(() => { result.current.setSearch(''); });

      expect(result.current.filtered).toHaveLength(2);
    });

    it('returns empty filtered list when no title matches the search', () => {
      seedTemplates([makeTemplate('t1', 'Alpha'), makeTemplate('t2', 'Beta')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      act(() => { result.current.setSearch('zzz-no-match'); });

      expect(result.current.filtered).toHaveLength(0);
    });

    it('items includes NEW card + matching templates only', () => {
      seedTemplates([makeTemplate('t1', 'Alpha Form'), makeTemplate('t2', 'Beta Survey')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      act(() => { result.current.setSearch('beta'); });

      // NEW card + 1 matching template
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]).toMatchObject({ kind: 'new' });
    });
  });

  describe('grid row chunking', () => {
    it('splits items into rows based on colCount', () => {
      seedTemplates([
        makeTemplate('t1', 'A'),
        makeTemplate('t2', 'B'),
        makeTemplate('t3', 'C'),
        makeTemplate('t4', 'D'),
      ]);
      const { result } = renderHook(() => useHome(), { wrapper });

      // jsdom doesn't have a real window.innerWidth; getColCount falls back to 3
      const colCount = result.current.colCount;
      const totalItems = result.current.items.length; // NEW + 4 templates = 5
      const expectedRows = Math.ceil(totalItems / colCount);

      expect(result.current.rows).toHaveLength(expectedRows);
      // Every item should appear exactly once across all rows
      const flat = result.current.rows.flat();
      expect(flat).toHaveLength(totalItems);
    });
  });

  describe('delete flow', () => {
    it('confirmDelete sets deleteId', () => {
      const { result } = renderHook(() => useHome(), { wrapper });
      act(() => { result.current.confirmDelete('some-id'); });
      expect(result.current.deleteId).toBe('some-id');
    });

    it('cancelDelete clears deleteId', () => {
      const { result } = renderHook(() => useHome(), { wrapper });
      act(() => { result.current.confirmDelete('some-id'); });
      act(() => { result.current.cancelDelete(); });
      expect(result.current.deleteId).toBeNull();
    });

    it('executeDelete clears deleteId and removes the template', () => {
      seedTemplates([makeTemplate('t1', 'Alpha')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      expect(result.current.templates).toHaveLength(1);
      act(() => { result.current.confirmDelete('t1'); });
      act(() => { result.current.executeDelete(); });

      expect(result.current.deleteId).toBeNull();
      expect(result.current.templates).toHaveLength(0);
    });

    it('executeDelete is a no-op when deleteId is null', () => {
      seedTemplates([makeTemplate('t1', 'Alpha')]);
      const { result } = renderHook(() => useHome(), { wrapper });

      act(() => { result.current.executeDelete(); });

      // Nothing deleted; deleteId remains null
      expect(result.current.deleteId).toBeNull();
      expect(result.current.templates).toHaveLength(1);
    });
  });
});
