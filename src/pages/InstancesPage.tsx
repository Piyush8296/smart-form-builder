import { useNavigate } from 'react-router-dom';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';

const ICON_SEARCH = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
const ICON_DOWNLOAD = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>;
const ICON_MORE = <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>;
const ICON_MENU = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;

interface InstanceRow {
  id: string;
  name: string;
  email: string;
  date: string;
  status: 'submitted' | 'draft';
}

const ROWS: InstanceRow[] = [
  { id: 'inst_8f3c…21a', name: 'Avery Lin',    email: 'avery@northwind.co', date: 'May 14, 14:32', status: 'submitted' },
  { id: 'inst_2b6e…ff0', name: 'Priya Shah',   email: 'priya@helios.io',   date: 'May 14, 12:11', status: 'submitted' },
  { id: 'inst_91ad…7c4', name: 'Marcus Voss',  email: 'm.voss@plata.co',   date: 'May 13, 17:45', status: 'submitted' },
  { id: 'inst_4e0d…b32', name: '—',            email: '—',                 date: 'May 13, 16:02', status: 'draft' },
  { id: 'inst_77a5…91e', name: 'Jamie Park',   email: 'jamie@oxbow.dev',   date: 'May 12, 09:28', status: 'submitted' },
  { id: 'inst_c4f8…0e6', name: 'Rana Aoki',    email: 'rana@sundial.app',  date: 'May 11, 19:13', status: 'submitted' },
];

export default function InstancesPage() {
  const navigate = useNavigate();

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
          <div className="mb-section">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="label-mono mb-1.5">Template · cust_onboarding_q3</div>
                <h1 className="text-display font-semibold tracking-display m-0 max-mob:text-title">Customer onboarding · Q3</h1>
                <p className="text-muted mt-1 text-sm mb-0">312 responses · 1 active draft · last submitted 6 minutes ago</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Export CSV</Button>
                <Button variant="secondary" onClick={() => navigate('/builder/cust-onboarding-q3')}>Edit form</Button>
                <Button variant="primary" onClick={() => navigate('/fill/cust-onboarding-q3')}>Open form</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-section flex-wrap">
            <div className="relative flex-1 min-w-50 max-w-90">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center">{ICON_SEARCH}</span>
              <input className="input pl-8" placeholder="Search by name or email…" />
            </div>
            <Button variant="secondary" size="sm">All</Button>
            <Button variant="ghost" size="sm">Submitted</Button>
            <Button variant="ghost" size="sm">Drafts</Button>
          </div>

          <div className="w-full bg-surface border border-border rounded-lg overflow-hidden">
            <div className="grid grid-instances-row items-center px-section py-3.5 border-b border-divider text-ui bg-surface-2 font-mono text-label text-muted uppercase tracking-wide max-mob:hidden">
              <span>ID</span>
              <span>Respondent</span>
              <span>Submitted</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            {ROWS.map((row) => (
              <div key={row.id} className="grid grid-instances-row items-center px-section py-3.5 border-b border-divider text-ui last:border-b-0 max-mob:grid-cols-1 max-mob:gap-1">
                <span className="font-mono text-meta text-muted">{row.id}</span>
                <span>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-muted text-caption">{row.email}</div>
                </span>
                <span className="font-mono text-caption text-muted">{row.date}</span>
                <span>
                  {row.status === 'submitted'
                    ? <span className="chip chip-success">submitted</span>
                    : <span className="chip">draft</span>}
                </span>
                <span className="flex gap-1 justify-end max-mob:justify-start max-mob:mt-1.5">
                  <Button variant="ghost" size="sm" icon title="Download PDF">{ICON_DOWNLOAD}</Button>
                  <Button variant="ghost" size="sm">View</Button>
                  <Button variant="ghost" size="sm" icon>{ICON_MORE}</Button>
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
