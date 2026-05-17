import { useState, useMemo } from 'react';
import { useStorage } from './useStorage';
import type { InstanceSummary } from '../types/instance';

export function useInstancesPage(templateId: string) {
  const { loadTemplate, loadInstances, removeInstance, error } = useStorage();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const template = loadTemplate(templateId);
  const allInstances: InstanceSummary[] = loadInstances(templateId);

  const filtered = useMemo(
    () => allInstances.filter((inst) => inst.id.toLowerCase().includes(search.toLowerCase())),
    [allInstances, search],
  );

  function exportCSV() {
    const rows = [['ID', 'Submitted At']];
    for (const inst of allInstances) {
      rows.push([inst.id, inst.submittedAt]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.title ?? templateId}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function confirmDelete(id: string) { setDeleteId(id); }
  function cancelDelete() { setDeleteId(null); }
  function executeDelete() {
    if (deleteId) removeInstance(deleteId, templateId);
    setDeleteId(null);
  }

  return { template, allInstances, filtered, search, setSearch, deleteId, error, exportCSV, confirmDelete, cancelDelete, executeDelete };
}
