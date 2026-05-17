import { FieldKind } from '../enums';
import type { Template, TemplateSummary } from '../types/template';
import { TEMPLATES_KEY, templateKey } from './keys';

export function listTemplates(): TemplateSummary[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TemplateSummary[];
  } catch {
    console.warn('[templateStore] corrupted index, resetting');
    return [];
  }
}

export function getTemplate(id: string): Template | null {
  try {
    const raw = localStorage.getItem(templateKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Template;
  } catch {
    console.warn(`[templateStore] corrupted template ${id}`);
    return null;
  }
}

export function saveTemplate(t: Template): void {
  try {
    localStorage.setItem(templateKey(t.id), JSON.stringify(t));
    // Draft templates are persisted for loading but excluded from the summary index
    // until the user makes their first modification (isDraft stripped by BuilderContext).
    if (t.isDraft) return;
    const summaries = listTemplates();
    const summary: TemplateSummary = {
      id: t.id,
      title: t.title,
      fieldCount: t.fields.filter((f) => f.kind !== FieldKind.SECTION_HEADER).length,
      updatedAt: t.updatedAt,
    };
    const idx = summaries.findIndex((s) => s.id === t.id);
    if (idx >= 0) summaries[idx] = summary;
    else summaries.unshift(summary);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(summaries));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some templates to free up space.', { cause: e });
    }
    throw e;
  }
}

export function deleteTemplate(id: string): void {
  localStorage.removeItem(templateKey(id));
  const summaries = listTemplates().filter((s) => s.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(summaries));
}
