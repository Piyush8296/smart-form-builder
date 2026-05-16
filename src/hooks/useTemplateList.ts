import { useState, useCallback } from 'react';
import type { TemplateSummary, Template } from '../types/template';
import { listTemplates, saveTemplate, deleteTemplate } from '../storage/templateStore';
import { generateId } from '../utils/id';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';

export function useTemplateList() {
  const [templates, setTemplates] = useState<TemplateSummary[]>(() => listTemplates());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setTemplates(listTemplates());
  }, []);

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
      // Saves template data for loadTemplate() but skips summary index (isDraft: true).
      // Template enters the Home list only after first modification in BuilderContext.
      saveTemplate(template);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create template.');
    }
    return template;
  }

  function removeTemplate(id: string) {
    try {
      deleteTemplate(id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete template.');
    }
  }

  return { templates, error, refresh, createTemplate, removeTemplate };
}
