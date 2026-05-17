import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  listInstances,
  getInstance,
  saveInstance,
  deleteInstance,
  saveDraft,
  getDraft,
  clearDraft,
} from './instanceStore';
import { instanceKey, instancesKey, draftKey } from './keys';
import type { Instance } from '../types/instance';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeInstance(id: string, templateId = 'tmpl-1'): Instance {
  const now = new Date().toISOString();
  return {
    id,
    templateId,
    answers: [],
    submittedAt: now,
    createdAt: now,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('instanceStore', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  describe('listInstances', () => {
    it('returns an empty array when no instances exist for the template', () => {
      expect(listInstances('tmpl-1')).toEqual([]);
    });

    it('returns summaries for a given template', () => {
      const inst = makeInstance('i1', 'tmpl-1');
      saveInstance(inst);
      const list = listInstances('tmpl-1');
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('i1');
    });

    it('returns empty array on corrupted JSON', () => {
      localStorage.setItem(instancesKey('tmpl-1'), 'bad{json');
      expect(listInstances('tmpl-1')).toEqual([]);
    });
  });

  describe('getInstance', () => {
    it('returns null for a nonexistent instance', () => {
      expect(getInstance('ghost')).toBeNull();
    });

    it('returns the stored instance', () => {
      const inst = makeInstance('i1');
      saveInstance(inst);
      const loaded = getInstance('i1');
      expect(loaded?.id).toBe('i1');
    });

    it('returns null when stored JSON is corrupted', () => {
      localStorage.setItem(instanceKey('bad'), '{invalid}');
      expect(getInstance('bad')).toBeNull();
    });
  });

  describe('saveInstance', () => {
    it('persists the instance to localStorage', () => {
      const inst = makeInstance('i1', 'tmpl-1');
      saveInstance(inst);
      expect(localStorage.getItem(instanceKey('i1'))).not.toBeNull();
    });

    it('adds a summary to the template instance index', () => {
      const inst = makeInstance('i1', 'tmpl-1');
      saveInstance(inst);
      const list = listInstances('tmpl-1');
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('i1');
    });

    it('prepends new instances to the summary list', () => {
      saveInstance(makeInstance('i1', 'tmpl-1'));
      saveInstance(makeInstance('i2', 'tmpl-1'));
      const list = listInstances('tmpl-1');
      expect(list[0].id).toBe('i2');
    });

    it('updates an existing summary if the instance already exists', () => {
      const inst = makeInstance('i1', 'tmpl-1');
      saveInstance(inst);
      saveInstance({ ...inst, submittedAt: '2099-01-01T00:00:00.000Z' });
      const list = listInstances('tmpl-1');
      expect(list).toHaveLength(1);
      expect(list[0].submittedAt).toBe('2099-01-01T00:00:00.000Z');
    });

    it('throws a readable error on QuotaExceededError', () => {
      const quotaError = new DOMException('quota exceeded', 'QuotaExceededError');
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw quotaError; });
      expect(() => saveInstance(makeInstance('i1'))).toThrowError(/quota exceeded/i);
    });
  });

  describe('deleteInstance', () => {
    it('removes the instance record', () => {
      saveInstance(makeInstance('i1', 'tmpl-1'));
      deleteInstance('i1', 'tmpl-1');
      expect(localStorage.getItem(instanceKey('i1'))).toBeNull();
    });

    it('removes the instance from the template index', () => {
      saveInstance(makeInstance('i1', 'tmpl-1'));
      saveInstance(makeInstance('i2', 'tmpl-1'));
      deleteInstance('i1', 'tmpl-1');
      const list = listInstances('tmpl-1');
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('i2');
    });
  });

  describe('saveDraft / getDraft / clearDraft', () => {
    it('saves and retrieves draft answers', () => {
      const answers = new Map<string, import('../types/fields').FieldValue>([['f1', 'hello'], ['f2', 42]]);
      saveDraft('tmpl-1', answers);
      const draft = getDraft('tmpl-1');
      expect(draft).not.toBeNull();
      expect(draft?.get('f1')).toBe('hello');
      expect(draft?.get('f2')).toBe(42);
    });

    it('getDraft returns null when no draft exists', () => {
      expect(getDraft('tmpl-no-draft')).toBeNull();
    });

    it('getDraft returns null when JSON is corrupted', () => {
      localStorage.setItem(draftKey('tmpl-bad'), 'bad{json');
      expect(getDraft('tmpl-bad')).toBeNull();
    });

    it('clearDraft removes the draft from localStorage', () => {
      saveDraft('tmpl-1', new Map([['f1', 'value']]));
      clearDraft('tmpl-1');
      expect(getDraft('tmpl-1')).toBeNull();
    });

    it('saveDraft does not throw on storage errors (non-critical)', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => { throw new Error('full'); });
      // Should not throw
      expect(() => saveDraft('tmpl-1', new Map())).not.toThrow();
    });
  });
});
