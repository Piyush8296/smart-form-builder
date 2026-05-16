import { useNavigate } from 'react-router-dom';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';

interface Template {
  id: string;
  name: string;
  desc: string;
  swatch: string;
  fields: number;
  instances: number;
  updated: string;
}

const TEMPLATES: Template[] = [
  { id: 'cust-onboarding-q3', name: 'Customer onboarding', desc: 'Capture contact info, plan, and document upload at signup.', swatch: 'oklch(0.62 0.15 35)', fields: 14, instances: 312, updated: '2d ago' },
  { id: 'event-registration', name: 'Event registration', desc: 'Track dietary needs, session preferences, and headshots.', swatch: 'oklch(0.5 0.12 240)', fields: 11, instances: 86, updated: '6h ago' },
  { id: 'job-application-eng', name: 'Job application — engineering', desc: 'Resume, links, take-home submission, salary expectations.', swatch: 'oklch(0.45 0.1 150)', fields: 18, instances: 47, updated: '3d ago' },
  { id: 'support-escalation', name: 'Support escalation', desc: 'Severity, affected accounts, repro steps, signature.', swatch: 'oklch(0.4 0.08 280)', fields: 9, instances: 1204, updated: '11m ago' },
  { id: 'vendor-onboarding', name: 'Vendor onboarding', desc: 'W-9 upload, banking, NDA acknowledgement.', swatch: 'oklch(0.6 0.12 60)', fields: 16, instances: 28, updated: '1w ago' },
  { id: 'expense-reimbursement', name: 'Internal expense reimbursement', desc: 'Receipts, calculation totals per category, sign-off.', swatch: 'oklch(0.55 0.13 200)', fields: 13, instances: 421, updated: '4d ago' },
];

const ICON_SEARCH = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const ICON_PLUS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const ICON_MORE = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>;
const ICON_MENU = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;

export default function Home() {
  const navigate = useNavigate();
  const totalResponses = TEMPLATES.reduce((s, t) => s + t.instances, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border topbar-glass sticky top-0 z-40 flex items-center px-5">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand />
          <nav className="hidden mob:flex gap-0.5 ml-2">
            <button className="px-2.5 py-1.5 rounded-md text-ui text-ink font-medium bg-surface-3">Templates</button>
            <button
              className="px-2.5 py-1.5 rounded-md text-ui text-muted font-medium hover:bg-surface-2 hover:text-ink transition-colors"
              onClick={() => navigate('/templates/cust-onboarding-q3/instances')}
            >Responses</button>
          </nav>
          <div className="flex-1" />
          <Button variant="secondary" className="hidden mob:inline-flex">Import JSON</Button>
          <Button variant="primary" className="hidden mob:inline-flex" onClick={() => navigate('/builder/new')}>
            {ICON_PLUS} New form
          </Button>
          <button className="flex mob:hidden px-2.5 py-1.5 rounded-md text-muted hover:bg-surface-2 transition-colors" aria-label="menu">{ICON_MENU}</button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="w-full max-w-app mx-auto px-6 pt-8 pb-20 max-mob:px-3.5 max-mob:pt-5 max-mob:pb-15">
          <div className="flex items-end justify-between gap-6 mb-7 flex-wrap max-mob:gap-3">
            <div>
              <h1 className="text-display font-semibold tracking-display m-0 max-mob:text-title">Templates</h1>
              <p className="text-muted mt-1 text-sm mb-0">
                {TEMPLATES.length} templates · {totalResponses.toLocaleString()} total responses · drafts auto-save locally
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Import JSON</Button>
              <Button variant="primary" onClick={() => navigate('/builder/new')}>{ICON_PLUS} New form</Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-section flex-wrap">
            <div className="relative flex-1 min-w-50 max-w-90">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">{ICON_SEARCH}</span>
              <input className="input pl-8" placeholder="Search templates…" />
            </div>
            <Button variant="secondary" size="sm">All</Button>
            <Button variant="ghost" size="sm">Recent</Button>
            <Button variant="ghost" size="sm">Archived</Button>
            <span className="flex-1" />
            <span className="label-mono">Sort · Updated ↓</span>
          </div>

          <div className="grid gap-4 grid-templates-auto">
            <button
              className="border border-dashed border-border-strong bg-transparent grid place-items-center min-h-42 text-muted text-ui gap-1.5 cursor-pointer rounded-lg transition-colors duration-150 hover:border-ink hover:text-ink hover:bg-surface"
              onClick={() => navigate('/builder/new')}
            >
              <span className="w-8 h-8 rounded-lg bg-surface border border-border grid place-items-center text-ink">{ICON_PLUS}</span>
              <span>Start a blank form</span>
              <span className="text-label text-muted-2 font-mono">or pick a template →</span>
            </button>

            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="bg-surface border border-border rounded-lg px-4.5 pt-4.5 pb-4 flex flex-col gap-3 transition-card text-left cursor-pointer min-h-42 hover:border-border-strong hover:-translate-y-px"
                onClick={() => navigate(`/builder/${t.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/builder/${t.id}`); } }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-7 h-7 rounded-md" style={{ background: t.swatch }} />
                  <button
                    className="inline-flex items-center justify-center w-7.5 h-7 rounded text-ink-2 hover:bg-surface-2"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="More options"
                  >
                    {ICON_MORE}
                  </button>
                </div>
                <div>
                  <h3 className="font-medium text-question tracking-snug-xs m-0">{t.name}</h3>
                  <p className="text-muted text-desc leading-desc line-clamp-2 m-0">{t.desc}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-divider text-meta text-muted font-mono">
                  <span
                    className="cursor-pointer hover:text-ink"
                    onClick={(e) => { e.stopPropagation(); navigate(`/templates/${t.id}/instances`); }}
                  >
                    {t.fields} fields · {t.instances.toLocaleString()} responses
                  </span>
                  <span>{t.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
