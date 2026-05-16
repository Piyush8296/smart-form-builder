import { useState, useCallback } from 'react';
import type { TemplateSummary, Template } from '../types/template';
import { saveTemplate, deleteTemplate } from '../storage/templateStore';
import { getOwnedSummaries, addOwnership, removeOwnership } from '../storage/accessStore';
import { useSession } from '../contexts/SessionContext';
import { generateId } from '../utils/id';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';

export function useTemplateList() {
  const { session } = useSession();
  const userId = session!.userId;

  const [templates, setTemplates] = useState<TemplateSummary[]>(() => getOwnedSummaries(userId));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTemplates(getOwnedSummaries(userId));
  }, [userId]);

  function createTemplate(title = 'Untitled form'): Template {
    const now = new Date().toISOString();
    const template: Template = {
      id: generateId(),
      title,
      description: '',
      fields: [],
      settings: { ...DEFAULT_TEMPLATE_SETTINGS },
      createdAt: now,
      updatedAt: now,
      isDraft: true,
    };
    try {
      saveTemplate(template);
      addOwnership(userId, template.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create template.');
    }
    return template;
  }

  function removeTemplate(id: string) {
    try {
      deleteTemplate(id);
      removeOwnership(userId, id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete template.');
    }
  }

  return { templates, error, refresh, createTemplate, removeTemplate };
}
