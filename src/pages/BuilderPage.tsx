import { useState } from 'react';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';

const ICON = {
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>,
  eye: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  copy: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trash: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>,
  branch: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="3" r="2"/><circle cx="6" cy="21" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 5v6a4 4 0 0 0 4 4h6M6 13v6"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>,
  text: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V5h16v2"/><path d="M12 5v14"/><path d="M9 19h6"/></svg>,
  para: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  num: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>,
  date: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  time: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  radio: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none"/></svg>,
  checkIcon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>,
  scale: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18"/><path d="M6 9v6M10 9v6M14 9v6M18 9v6"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.6 8.6l7 .6-5.3 4.6 1.6 6.8L12 16.9 6.1 20.6l1.6-6.8L2.4 9.2l7-.6z"/></svg>,
  file: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>,
  sig: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 19c4-4 8 4 12 0s4-12 6-12"/><path d="M3 21h18"/></svg>,
  heading: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 4v16M18 4v16M6 12h12"/></svg>,
  calc: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>,
  phone: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1l-1.3 1.3a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></svg>,
  grip: <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><circle cx="3" cy="3" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="3" cy="7" r="1.2"/><circle cx="9" cy="7" r="1.2"/><circle cx="3" cy="11" r="1.2"/><circle cx="9" cy="11" r="1.2"/></svg>,
  chev: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
};

interface CanvasFieldProps {
  label: string;
  kindLabel: string;
  required?: boolean;
  hasCondition?: boolean;
  selected?: boolean;
  hidden?: boolean;
  desc?: string;
  preview: React.ReactNode;
}

function CanvasField({ label, kindLabel, required, hasCondition, selected, hidden, desc, preview }: CanvasFieldProps) {
  return (
    <div
      className="group/field bg-surface border border-border rounded-lg mb-2.5 relative transition-control hover:border-border-strong data-[selected=true]:border-ink data-[selected=true]:shadow-rail-accent data-[hidden=true]:opacity-55"
      data-selected={selected}
      data-hidden={hidden}
    >
      <span className="absolute top-3.5 -left-5.5 text-muted-2 cursor-grab opacity-0 transition-opacity duration-control w-4.5 h-4.5 grid place-items-center group-hover/field:opacity-100 group-data-[selected=true]/field:opacity-100">
        {ICON.grip}
      </span>
      <div className="px-card py-section max-mob:px-3.5 max-mob:py-3.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-sm font-medium text-ink">
            {label}{required && <span className="text-danger font-semibold ml-0.5">*</span>}
          </span>
          {hidden && <span className="chip">{ICON.eye} Hidden</span>}
          {hasCondition && <span className="chip chip-accent">{ICON.branch} Conditional</span>}
        </div>
        {desc && <div className="text-muted text-desc mb-3">{desc}</div>}
        <div>{preview}</div>
      </div>
      <div className="flex items-center justify-between border-t border-divider px-section py-2 gap-3 flex-wrap max-mob:px-3">
        <div className="flex gap-2 items-center font-mono text-label text-muted">
          <span>{kindLabel}</span>
          {required && <><span>·</span><span>required</span></>}
        </div>
        <div className="flex gap-0.5 ml-auto">
          <Button variant="ghost" size="sm" icon title="Duplicate">{ICON.copy}</Button>
          <Button variant="ghost" size="sm" icon title="Add condition">{ICON.branch}</Button>
          <Button variant="ghost" size="sm">
            Required <span className="toggle ml-1.5" data-on={required} aria-hidden="true" />
          </Button>
          <Button variant="danger-ghost" size="sm" icon title="Delete">{ICON.trash}</Button>
        </div>
      </div>
    </div>
  );
}

function LeftPane() {
  const groups = [
    {
      title: 'Input',
      items: [
        { icon: ICON.text, label: 'Short text', kbd: 'T' },
        { icon: ICON.para, label: 'Paragraph', kbd: 'P' },
        { icon: ICON.num, label: 'Number', kbd: 'N' },
        { icon: ICON.date, label: 'Date', kbd: 'D' },
        { icon: ICON.time, label: 'Time', kbd: '' },
        { icon: ICON.phone, label: 'Phone', kbd: '' },
      ],
    },
    {
      title: 'Choice',
      items: [
        { icon: ICON.radio, label: 'Single select', kbd: 'S' },
        { icon: ICON.checkIcon, label: 'Multi select', kbd: 'M' },
        { icon: ICON.scale, label: 'Linear scale', kbd: '' },
        { icon: ICON.star, label: 'Rating', kbd: '' },
      ],
    },
    {
      title: 'Special',
      items: [
        { icon: ICON.file, label: 'File upload', kbd: '' },
        { icon: ICON.sig, label: 'Signature', kbd: '' },
        { icon: ICON.heading, label: 'Section header', kbd: 'H' },
        { icon: ICON.calc, label: 'Calculation', kbd: '' },
      ],
    },
  ];

  return (
    <>
      <div className="sticky top-0 bg-inherit px-4 py-3.5 pb-2.5 border-b border-divider z-lifted">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-muted m-0">Add field</h3>
      </div>
      <div className="px-3.5 py-3.5 pb-10">
        {groups.map((g) => (
          <div key={g.title} className="mb-section">
            <div className="text-2xs font-semibold uppercase tracking-widest text-muted-2 px-2 py-1 mb-1">{g.title}</div>
            {g.items.map((item) => (
              <button key={item.label} className="flex items-center gap-2.5 w-full px-2 py-1.75 rounded-md text-ui text-ink cursor-grab transition-colors hover:bg-surface">
                <span className="w-6 h-6 grid place-items-center bg-surface border border-border rounded-md text-ink-2 shrink-0">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.kbd && <span className="kbd">{item.kbd}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="h-px bg-divider my-4" />
        <p className="text-caption text-muted px-2">Drag a field onto the canvas, or click to append at the end.</p>
      </div>
    </>
  );
}

function BuilderCanvas() {
  return (
    <div className="max-w-content mx-auto">
      <div className="bg-surface border border-border border-t-4 border-t-ink rounded-lg px-7 py-6 mb-3.5 max-mob:px-5">
        <h2 className="text-title font-semibold tracking-snug m-0 mb-1.5">Customer onboarding · Q3</h2>
        <p className="text-muted text-ui m-0">Welcome! We'll get your workspace set up in about 4 minutes. Required fields are marked with an asterisk.</p>
      </div>

      <CanvasField
        label="Full legal name"
        kindLabel="Short text"
        required
        preview={<input className="input" placeholder="Type a short answer…" disabled />}
      />

      <CanvasField
        label="Work email"
        kindLabel="Short text · regex"
        required
        desc="We'll send confirmation here. Must match /^[^@]+@[^@]+\.[a-z]+$/."
        preview={<input className="input" placeholder="name@company.com" disabled />}
      />

      <CanvasField
        label="Country"
        kindLabel="Single select · combobox"
        required
        selected
        preview={
          <div className="relative">
            <input className="input" placeholder="Type to filter…" defaultValue="United S" disabled />
            <div className="absolute top-10.5 left-0 right-0 bg-surface border border-border rounded-md shadow-popover p-1.5 z-raised">
              <div className="px-2.5 py-2 rounded bg-surface-2 text-ui">United States</div>
              <div className="px-2.5 py-2 rounded text-ui text-muted">United Kingdom</div>
              <div className="px-2.5 py-2 rounded text-ui text-muted">United Arab Emirates</div>
            </div>
            <div className="h-30" />
          </div>
        }
      />

      <CanvasField
        label="State"
        kindLabel="Single select · dropdown"
        required
        hasCondition
        desc="Shown when Country = United States"
        preview={<button className="w-full h-9 border border-border rounded-md px-2.5 bg-surface text-muted text-ui text-left">Choose a state…</button>}
      />

      <CanvasField
        label="How did you hear about us?"
        kindLabel="Multi select · 5 options"
        preview={
          <div className="choice-list">
            <div className="choice-row"><span className="box" /> Search engine</div>
            <div className="choice-row" data-selected="true"><span className="box">{ICON.check}</span> Referral from a colleague</div>
            <div className="choice-row"><span className="box" /> Podcast</div>
            <div className="choice-row"><span className="box" /> Other</div>
          </div>
        }
      />

      <CanvasField
        label="Team size"
        kindLabel="Linear scale · 1–10"
        required
        preview={
          <>
            <div className="scale-row">
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <button key={n} className="scale-btn" data-selected={n === 4}>{n}</button>
              ))}
            </div>
            <div className="scale-endpoints"><span>Just me</span><span>Enterprise</span></div>
          </>
        }
      />

      <CanvasField
        label="Upload signed MSA"
        kindLabel="File upload · PDF only · max 10 MB"
        hidden
        hasCondition
        desc="Shown when Plan = Enterprise"
        preview={<div className="file-drop"><strong>Click to upload</strong> or drag and drop · PDF only</div>}
      />

      <button className="flex items-center justify-center gap-2 p-3 border border-dashed border-border-strong rounded-lg mt-3.5 text-muted text-ui cursor-pointer w-full transition-colors duration-150 hover:border-ink hover:text-ink hover:bg-surface">
        {ICON.plus} Add field
      </button>
    </div>
  );
}

function RightPane() {
  const [activeTab, setActiveTab] = useState<'Field' | 'Logic' | 'Validation'>('Field');
  const [allowOther, setAllowOther] = useState(true);
  const [shuffleDisplay, setShuffleDisplay] = useState(false);
  const [required, setRequired] = useState(true);
  const [visibleByDefault, setVisibleByDefault] = useState(true);

  return (
    <>
      <div className="flex border-b border-divider px-3 gap-1">
        {(['Field', 'Logic', 'Validation'] as const).map((tab) => (
          <button
            key={tab}
            className="px-2 py-2.5 text-caption text-muted border-b-2 border-transparent -mb-px cursor-pointer hover:text-ink data-[active=true]:text-ink data-[active=true]:border-ink data-[active=true]:font-medium"
            data-active={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 pb-2 border-b border-divider">
        <div className="text-label font-semibold uppercase tracking-wider text-muted mb-2.5">Field · Country</div>
        <label className="block text-caption font-medium text-ink-2 mb-1.5 tracking-loose">Label</label>
        <input className="input" defaultValue="Country" />
        <div className="h-2.5" />
        <label className="block text-caption font-medium text-ink-2 mb-1.5 tracking-loose">Description</label>
        <input className="input" placeholder="Optional helper text" />
        <div className="h-2.5" />
        <label className="block text-caption font-medium text-ink-2 mb-1.5 tracking-loose">Variant</label>
        <div className="grid grid-cols-2 gap-1.5">
          <Button variant="secondary" size="sm">Radio</Button>
          <Button variant="secondary" size="sm">Dropdown</Button>
          <Button variant="secondary" size="sm">Tiles</Button>
          <Button variant="primary" size="sm">Combobox</Button>
        </div>
      </div>

      <div className="px-4 py-4 pb-2 border-b border-divider">
        <div className="text-label font-semibold uppercase tracking-wider text-muted mb-2.5">Options · 4 of 195</div>
        {['United States', 'United Kingdom', 'Canada', 'Germany'].map((opt) => (
          <div key={opt} className="flex items-center gap-2 mb-1.5">
            <span className="text-muted-2 cursor-grab w-3.5 grid place-items-center">{ICON.grip}</span>
            <span className="w-3.5 h-3.5 border-thin border-border-strong rounded-full shrink-0" />
            <input className="input h-7.5 text-desc" defaultValue={opt} />
            <Button variant="ghost" size="sm" icon>{ICON.trash}</Button>
          </div>
        ))}
        <Button variant="ghost" size="sm">{ICON.plus} Add option</Button>
        <Button variant="ghost" size="sm">Bulk paste</Button>
        <div className="h-2" />
        <Toggle on={allowOther} onChange={setAllowOther} label='Allow "Other"' sub="Adds an Other option with free-text input" />
        <Toggle on={shuffleDisplay} onChange={setShuffleDisplay} label="Shuffle on display" sub='Fisher-Yates per session; "Other" pinned last' />
      </div>

      <div className="px-4 py-4 pb-2 border-b border-divider">
        <div className="flex items-baseline justify-between mb-2.5">
          <div className="text-label font-semibold uppercase tracking-wider text-muted">Conditions</div>
          <span className="text-muted font-normal normal-case tracking-normal font-mono text-2xs">all conditions evaluated independently</span>
        </div>
        <div className="bg-surface-2 border border-border rounded-md p-2.5 grid gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-caption text-ink-2">{ICON.branch}<strong>Show</strong> this field when…</div>
          <div className="grid grid-cols-2 gap-1.5">
            <select className="select h-7 text-caption"><option>Plan tier</option></select>
            <select className="select h-7 text-caption"><option>equals</option></select>
          </div>
          <input className="input h-7 text-caption" defaultValue="Enterprise" />
        </div>
        <Button variant="ghost" size="sm">{ICON.plus} Add condition</Button>
      </div>

      <div className="px-4 py-4 pb-2">
        <Toggle on={required} onChange={setRequired} label="Required" />
        <Toggle on={visibleByDefault} onChange={setVisibleByDefault} label="Visible by default" />
      </div>
    </>
  );
}

export default function BuilderPage() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="h-14 border-b border-border topbar-glass z-40 flex items-center px-5 flex-none">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand nameHidden />
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <input
              className="bg-transparent border border-transparent rounded-md py-1 px-2 w-full max-w-form-title text-sm font-medium tracking-snug-xs hover:bg-surface-2 focus:outline-0 focus:bg-surface focus:border-border"
              defaultValue="Customer onboarding · Q3"
            />
            <span className="text-muted text-caption font-mono whitespace-nowrap">14 fields · saved 12:04</span>
          </div>
          <Button variant="ghost" size="sm" icon title="Settings">{ICON.settings}</Button>
          <Button variant="secondary" size="sm">{ICON.eye} Preview</Button>
          <Button variant="primary" size="sm">Publish</Button>
        </div>
      </header>

      <div className="hidden max-canvas:flex gap-1 px-3 py-2 bg-surface border-b border-border flex-none z-10">
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setLeftOpen((v) => !v)}>
          {ICON.plus} Add
        </Button>
        <Button variant="primary" size="sm" className="flex-2">Form (7)</Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => setRightOpen((v) => !v)}>
          {ICON.settings}
        </Button>
      </div>

      <div className="flex-1 min-h-0 grid grid-builder-layout max-canvas:block max-canvas:overflow-y-auto bg-bg">
        <aside
          className="overflow-y-auto bg-surface-2 border-r border-border max-canvas:hidden max-canvas:data-[mobile-open=true]:block max-canvas:data-[mobile-open=true]:fixed max-canvas:data-[mobile-open=true]:top-14 max-canvas:data-[mobile-open=true]:bottom-0 max-canvas:data-[mobile-open=true]:left-0 max-canvas:data-[mobile-open=true]:w-80 max-canvas:data-[mobile-open=true]:z-30 max-canvas:data-[mobile-open=true]:shadow-popover"
          data-mobile-open={leftOpen}
        >
          <LeftPane />
        </aside>
        <main className="bg-bg px-6 py-7 pb-20 overflow-y-auto max-canvas:px-3 max-canvas:pt-5">
          <BuilderCanvas />
        </main>
        <aside
          className="overflow-y-auto bg-surface border-l border-border max-canvas:hidden max-canvas:data-[mobile-open=true]:block max-canvas:data-[mobile-open=true]:fixed max-canvas:data-[mobile-open=true]:top-14 max-canvas:data-[mobile-open=true]:bottom-0 max-canvas:data-[mobile-open=true]:right-0 max-canvas:data-[mobile-open=true]:w-80 max-canvas:data-[mobile-open=true]:z-30 max-canvas:data-[mobile-open=true]:shadow-popover"
          data-mobile-open={rightOpen}
        >
          <RightPane />
        </aside>
      </div>
    </div>
  );
}
