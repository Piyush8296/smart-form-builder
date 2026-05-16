import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useStorage } from '../hooks/useStorage';
import { useSession } from '../contexts/SessionContext';
import { isOwner } from '../storage/accessStore';
import type { InstanceSummary } from '../types/instance';

const ICON_SEARCH = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const ICON_MENU = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function InstancesPage() {
  const { id: templateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadTemplate, loadInstances, removeInstance, error } = useStorage();
  const { session } = useSession();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!templateId) { navigate('/'); return null; }

  // SAFETY: InstancesPage renders behind AuthGuard, which guarantees session is non-null.
  if (!isOwner(session!.userId, templateId)) {
    navigate('/');
    return null;
  }

  const template = loadTemplate(templateId);
  const allInstances: InstanceSummary[] = loadInstances(templateId);

  const filtered = allInstances.filter((inst) =>
    inst.id.toLowerCase().includes(search.toLowerCase()),
  );

  function handleExportCSV() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border topbar-glass sticky top-0 z-40 flex items-center px-5">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand />
          <nav className="hidden mob:flex gap-0.5 ml-2">
            <button
              className="px-2.5 py-1.5 rounded-md text-ui text-muted font-medium hover:bg-surface-2 hover:text-ink transition-colors"
              onClick={() => navigate('/')}
            >Templates</button>
            <button className="px-2.5 py-1.5 rounded-md text-ui text-ink font-medium bg-surface-3">Responses</button>
          </nav>
          <div className="flex-1" />
          <button className="flex mob:hidden px-2.5 py-1.5 rounded-md text-muted hover:bg-surface-2 transition-colors" aria-label="menu">{ICON_MENU}</button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="w-full max-w-app mx-auto px-6 pt-8 pb-20 max-mob:px-3.5 max-mob:pt-5">
          {error && (
            <div className="bg-surface border border-danger rounded-md px-4 py-3 text-danger text-sm mb-6">{error}</div>
          )}
          <div className="mb-section">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="label-mono mb-1.5">Template · {templateId}</div>
                <h1 className="text-display font-semibold tracking-display m-0 max-mob:text-title">
                  {template?.title ?? 'Responses'}
                </h1>
                <p className="text-muted mt-1 text-sm mb-0">{allInstances.length} responses</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
                {template && (
                  <Button variant="secondary" onClick={() => navigate(`/builder/${templateId}`)}>Edit form</Button>
                )}
                <Button variant="primary" onClick={() => navigate(`/fill/${templateId}`)}>Open form</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-section flex-wrap">
            <div className="relative flex-1 min-w-50 max-w-90">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">{ICON_SEARCH}</span>
              <input
                className="input pl-8"
                placeholder="Search by ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted">No responses yet.</div>
          ) : (
            <div className="w-full bg-surface border border-border rounded-lg overflow-hidden">
              <div className="grid grid-response-cols items-center px-section py-3.5 border-b border-divider text-ui bg-surface-2 font-mono text-label text-muted uppercase tracking-wide max-mob:hidden">
                <span>ID</span>
                <span>Submitted</span>
                <span className="text-right">Actions</span>
              </div>
              {filtered.map((inst) => (
                <div key={inst.id} className="grid grid-response-cols items-center px-section py-3.5 border-b border-divider text-ui last:border-b-0 max-mob:grid-cols-1 max-mob:gap-1">
                  <span className="font-mono text-meta text-muted truncate">{inst.id}</span>
                  <span className="font-mono text-caption text-muted">
                    {new Date(inst.submittedAt).toLocaleString()}
                  </span>
                  <span className="flex gap-1 justify-end max-mob:justify-start max-mob:mt-1.5">
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      onClick={() => setDeleteId(inst.id)}
                    >
                      Delete
                    </Button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete response"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger-ghost" onClick={() => { if (deleteId) removeInstance(deleteId, templateId); setDeleteId(null); }}>Delete</Button>
          </>
        }
      >
        <p className="text-ui text-muted m-0">Delete this response? This cannot be undone.</p>
      </Modal>
    </div>
  );
}
