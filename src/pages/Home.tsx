import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';
import { useTemplateList } from '../hooks/useTemplateList';
import { useSession } from '../contexts/SessionContext';
import type { TemplateSummary } from '../types/template';

const ICON_SEARCH = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const ICON_PLUS = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const ICON_MORE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
  </svg>
);
const ICON_MENU = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SWATCHES = [
  'oklch(0.62 0.15 35)',
  'oklch(0.5 0.12 240)',
  'oklch(0.45 0.1 150)',
  'oklch(0.4 0.08 280)',
  'oklch(0.6 0.12 60)',
  'oklch(0.55 0.13 200)',
];

const CARD_HEIGHT = 168;
const GAP = 16;
const ROW_HEIGHT = CARD_HEIGHT + GAP;

function getColCount(): number {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

type GridItem =
  | { kind: 'new' }
  | { kind: 'template'; template: TemplateSummary; index: number };

interface TemplateCardProps {
  template: TemplateSummary;
  index: number;
  onOpen: () => void;
  onViewResponses: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function TemplateCard({ template, index, onOpen, onViewResponses, onDelete }: TemplateCardProps) {
  return (
    <div
      className="bg-surface border border-border rounded-lg px-4.5 pt-4.5 pb-4 flex flex-col gap-3 transition-card text-left cursor-pointer hover:border-border-strong hover:-translate-y-px"
      style={{ height: CARD_HEIGHT }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-7 h-7 rounded-md shrink-0" style={{ background: SWATCHES[index % SWATCHES.length] }} />
        <button
          className="inline-flex items-center justify-center w-7.5 h-7 rounded text-ink-2 hover:bg-surface-2"
          onClick={onDelete}
          aria-label="Delete form"
        >
          {ICON_MORE}
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <h3 className="font-medium text-question tracking-snug-xs m-0 line-clamp-2">{template.title}</h3>
        <p className="text-muted text-desc m-0">{template.fieldCount} fields</p>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-divider text-meta text-muted font-mono">
        <span className="cursor-pointer hover:text-ink" onClick={onViewResponses}>
          View responses
        </span>
        <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function NewFormCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="border border-dashed border-border-strong bg-transparent grid place-items-center text-muted text-ui gap-1.5 cursor-pointer rounded-lg transition-colors hover:border-ink hover:text-ink hover:bg-surface w-full"
      style={{ height: CARD_HEIGHT }}
      onClick={onClick}
    >
      <span className="w-8 h-8 rounded-lg bg-surface border border-border grid place-items-center text-ink">{ICON_PLUS}</span>
      <span>Start a blank form</span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { templates, error, removeTemplate } = useTemplateList();
  const { session, logout } = useSession();
  const [search, setSearch] = useState('');
  const [colCount, setColCount] = useState(getColCount);

  useEffect(() => {
    function update() { setColCount(getColCount()); }
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  const filtered = useMemo(
    () => templates.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())),
    [templates, search],
  );

  // Flat items: new-card first, then filtered templates
  const items = useMemo<GridItem[]>(
    () => [{ kind: 'new' }, ...filtered.map((t, i) => ({ kind: 'template' as const, template: t, index: i }))],
    [filtered],
  );

  // Group items into rows of colCount
  const rows = useMemo<GridItem[][]>(() => {
    const result: GridItem[][] = [];
    for (let i = 0; i < items.length; i += colCount) {
      result.push(items.slice(i, i + colCount));
    }
    return result;
  }, [items, colCount]);

  const containerRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 4,
    scrollMargin: containerRef.current?.offsetTop ?? 0,
  });

  function handleNew() { navigate('/builder/new'); }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (confirm('Delete this form and all its responses?')) removeTemplate(id);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border topbar-glass sticky top-0 z-40 flex items-center px-5">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand />
          <nav className="hidden mob:flex gap-0.5 ml-2">
            <button className="px-2.5 py-1.5 rounded-md text-ui text-ink font-medium bg-surface-3">Templates</button>
          </nav>
          <div className="flex-1" />
          <Button variant="primary" className="hidden mob:inline-flex" onClick={handleNew}>
            {ICON_PLUS} New form
          </Button>
          <div className="hidden mob:flex items-center gap-2 pl-2 border-l border-border ml-1">
            <span className="text-ui text-muted truncate max-w-32">{session?.displayName}</span>
            <button
              className="px-2.5 py-1.5 rounded-md text-ui text-muted hover:bg-surface-2 hover:text-ink transition-colors"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
          <button className="flex mob:hidden px-2.5 py-1.5 rounded-md text-muted hover:bg-surface-2 transition-colors" aria-label="menu">{ICON_MENU}</button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="w-full max-w-app mx-auto px-6 pt-8 pb-20 max-mob:px-3.5 max-mob:pt-5 max-mob:pb-15">
          {error && (
            <div className="bg-surface border border-danger rounded-md px-4 py-3 text-danger text-sm mb-6">{error}</div>
          )}

          <div className="flex items-end justify-between gap-6 mb-7 flex-wrap max-mob:gap-3">
            <div>
              <h1 className="text-display font-semibold tracking-display m-0 max-mob:text-title">Templates</h1>
              <p className="text-muted mt-1 text-sm mb-0">
                {templates.length} form{templates.length !== 1 ? 's' : ''} · drafts auto-save locally
              </p>
            </div>
            <Button variant="primary" onClick={handleNew}>{ICON_PLUS} New form</Button>
          </div>

          <div className="flex items-center gap-2 mb-section flex-wrap">
            <div className="relative flex-1 min-w-50 max-w-90">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">{ICON_SEARCH}</span>
              <input
                className="input pl-8"
                placeholder="Search templates…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Virtualized grid — only visible rows in DOM */}
          <div
            ref={containerRef}
            style={{ position: 'relative', height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                    gap: GAP,
                    paddingBottom: GAP,
                  }}
                >
                  {row.map((item) => {
                    if (item.kind === 'new') {
                      return <NewFormCard key="new" onClick={handleNew} />;
                    }
                    return (
                      <TemplateCard
                        key={item.template.id}
                        template={item.template}
                        index={item.index}
                        onOpen={() => navigate(`/builder/${item.template.id}`)}
                        onViewResponses={(e) => { e.stopPropagation(); navigate(`/templates/${item.template.id}/instances`); }}
                        onDelete={(e) => handleDelete(e, item.template.id)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
