import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GridItemKind } from '../enums';
import { useTemplateList } from './useTemplateList';
import type { TemplateSummary } from '../types/template';

export type GridItem =
  | { kind: GridItemKind.NEW }
  | { kind: GridItemKind.TEMPLATE; template: TemplateSummary; index: number };

function getColCount(): number {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

export function useHome() {
  const navigate = useNavigate();
  const { templates, error, removeTemplate } = useTemplateList();
  const [search, setSearch] = useState('');
  const [colCount, setColCount] = useState(getColCount);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    function update() { setColCount(getColCount()); }
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  const filtered = useMemo(
    () => templates.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [templates, search],
  );

  const items = useMemo<GridItem[]>(
    () => [
      { kind: GridItemKind.NEW },
      ...filtered.map((t, i) => ({ kind: GridItemKind.TEMPLATE as const, template: t, index: i })),
    ],
    [filtered],
  );

  const rows = useMemo<GridItem[][]>(() => {
    const result: GridItem[][] = [];
    for (let i = 0; i < items.length; i += colCount) {
      result.push(items.slice(i, i + colCount));
    }
    return result;
  }, [items, colCount]);

  function handleNew() { navigate('/builder/new'); }
  function confirmDelete(id: string) { setDeleteId(id); }
  function cancelDelete() { setDeleteId(null); }
  function executeDelete() { if (deleteId) removeTemplate(deleteId); setDeleteId(null); }

  return { templates, filtered, items, rows, colCount, search, setSearch, deleteId, error, handleNew, confirmDelete, cancelDelete, executeDelete };
}
