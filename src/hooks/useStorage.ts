import { useState, useCallback } from 'react';
import type { Template } from '../types/template';
import type { Instance } from '../types/instance';
import { getTemplate } from '../storage/templateStore';
import { getInstance, listInstances, deleteInstance } from '../storage/instanceStore';
import { getDraft } from '../storage/instanceStore';
import type { FieldValue } from '../types/fields';

export function useStorage() {
  const [error, setError] = useState<string | null>(null);

  const loadTemplate = useCallback((id: string): Template | null => {
    return getTemplate(id);
  }, []);

  const loadInstance = useCallback((id: string): Instance | null => {
    return getInstance(id);
  }, []);

  const loadInstances = useCallback((templateId: string) => {
    return listInstances(templateId);
  }, []);

  const removeInstance = useCallback((id: string, templateId: string) => {
    try {
      deleteInstance(id, templateId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete response.');
    }
  }, []);

  const loadDraft = useCallback((templateId: string): Map<string, FieldValue> | null => {
    return getDraft(templateId);
  }, []);

  return { error, loadTemplate, loadInstance, loadInstances, removeInstance, loadDraft };
}
