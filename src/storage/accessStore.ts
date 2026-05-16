import type { TemplateSummary } from '../types/template';
import { USERS_KEY, userTemplatesKey } from './keys';
import { listTemplates } from './templateStore';

export function getOwnedIds(userId: string): string[] {
  try {
    const raw = localStorage.getItem(userTemplatesKey(userId));
    if (raw !== null) return JSON.parse(raw) as string[];
    // Migration: first user in this browser claims all existing templates
    const usersRaw = localStorage.getItem(USERS_KEY);
    const userCount = usersRaw ? Object.keys(JSON.parse(usersRaw) as Record<string, unknown>).length : 0;
    if (userCount <= 1) {
      const ids = listTemplates().map((s) => s.id);
      localStorage.setItem(userTemplatesKey(userId), JSON.stringify(ids));
      return ids;
    }
    localStorage.setItem(userTemplatesKey(userId), JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export function isOwner(userId: string, templateId: string): boolean {
  return getOwnedIds(userId).includes(templateId);
}

export function addOwnership(userId: string, templateId: string): void {
  const ids = getOwnedIds(userId);
  if (!ids.includes(templateId)) {
    ids.unshift(templateId);
    localStorage.setItem(userTemplatesKey(userId), JSON.stringify(ids));
  }
}

export function removeOwnership(userId: string, templateId: string): void {
  const ids = getOwnedIds(userId).filter((id) => id !== templateId);
  localStorage.setItem(userTemplatesKey(userId), JSON.stringify(ids));
}

export function getOwnedSummaries(userId: string): TemplateSummary[] {
  const ownedIds = getOwnedIds(userId);
  const all = listTemplates();
  return ownedIds
    .map((id) => all.find((s) => s.id === id))
    .filter((s): s is TemplateSummary => s !== undefined);
}
