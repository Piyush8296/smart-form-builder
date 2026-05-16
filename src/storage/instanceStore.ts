import type { Instance, InstanceSummary } from '../types/instance';
import type { FieldValue } from '../types/fields';
import { instanceKey, instancesKey, draftKey } from './keys';

export function listInstances(tid: string): InstanceSummary[] {
  try {
    const raw = localStorage.getItem(instancesKey(tid));
    if (!raw) return [];
    return JSON.parse(raw) as InstanceSummary[];
  } catch {
    console.warn(`[instanceStore] corrupted index for template ${tid}`);
    return [];
  }
}

export function getInstance(id: string): Instance | null {
  try {
    const raw = localStorage.getItem(instanceKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Instance;
  } catch {
    console.warn(`[instanceStore] corrupted instance ${id}`);
    return null;
  }
}

export function saveInstance(i: Instance): void {
  try {
    localStorage.setItem(instanceKey(i.id), JSON.stringify(i));
    const summaries = listInstances(i.templateId);
    const summary: InstanceSummary = { id: i.id, templateId: i.templateId, submittedAt: i.submittedAt };
    const idx = summaries.findIndex((s) => s.id === i.id);
    if (idx >= 0) summaries[idx] = summary;
    else summaries.unshift(summary);
    localStorage.setItem(instancesKey(i.templateId), JSON.stringify(summaries));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please export or delete some responses.', { cause: e });
    }
    throw e;
  }
}

export function deleteInstance(id: string, tid: string): void {
  localStorage.removeItem(instanceKey(id));
  const summaries = listInstances(tid).filter((s) => s.id !== id);
  localStorage.setItem(instancesKey(tid), JSON.stringify(summaries));
}

interface DraftData {
  answers: Record<string, FieldValue>;
}

export function saveDraft(tid: string, answers: Map<string, FieldValue>): void {
  try {
    const data: DraftData = { answers: Object.fromEntries(answers) };
    localStorage.setItem(draftKey(tid), JSON.stringify(data));
  } catch {
    // draft save failure is non-critical
  }
}

export function getDraft(tid: string): Map<string, FieldValue> | null {
  try {
    const raw = localStorage.getItem(draftKey(tid));
    if (!raw) return null;
    const data = JSON.parse(raw) as DraftData;
    return new Map(Object.entries(data.answers));
  } catch {
    console.warn(`[instanceStore] corrupted draft for template ${tid}`);
    return null;
  }
}

export function clearDraft(tid: string): void {
  localStorage.removeItem(draftKey(tid));
}
