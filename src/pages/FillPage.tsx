import { type ReactNode } from 'react';
import { cn } from '../utils/cn';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';

const ICON_ALERT = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>;
const ICON_CHECK = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>;
const ICON_DOWNLOAD = <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>;
const ICON_STAR = <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 14.6 8.6l7 .6-5.3 4.6 1.6 6.8L12 16.9 6.1 20.6l1.6-6.8L2.4 9.2l7-.6z"/></svg>;
const ICON_MENU = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;

interface FieldCardProps {
  error?: boolean;
  children: ReactNode;
}

function FieldCard({ error, children }: FieldCardProps) {
  return (
    <div className={cn(
      'bg-surface border rounded-lg px-7 py-card mb-3 max-mob:px-4 max-mob:py-section',
      error ? 'border-danger shadow-focus-danger' : 'border-border',
    )}>
      {children}
    </div>
  );
}

export default function FillPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-border topbar-glass sticky top-0 z-40 flex items-center px-5">
        <div className="flex items-center gap-3 w-full max-w-app mx-auto">
          <Brand />
          <div className="flex-1" />
          <Button variant="ghost" size="sm">{ICON_DOWNLOAD} Save PDF</Button>
          <button className="flex mob:hidden px-2.5 py-1.5 rounded-md text-muted hover:bg-surface-2 transition-colors" aria-label="menu">{ICON_MENU}</button>
        </div>
      </header>

      <div className="max-w-content mx-auto px-5 pt-8 pb-20 w-full max-mob:px-4">
        <div className="sticky top-14 mb-4 py-3 pb-3.5 bg-gradient-to-b from-bg from-70% to-transparent z-progress">
          <div className="flex justify-between font-mono text-label text-muted mb-1.5 uppercase tracking-wide">
            <span>Step 1 of 1</span>
            <span>62% complete</span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-progress" style={{ width: '62%' }} />
          </div>
        </div>

        <div className="border border-border border-t-4 border-t-ink bg-surface rounded-lg px-8 py-7 mb-4 max-mob:px-5 max-mob:py-5">
          <h1 className="m-0 mb-2 text-heading font-semibold tracking-heading max-mob:text-title">Customer onboarding · Q3</h1>
          <p className="m-0 text-muted text-sm">Welcome! We'll get your workspace set up in about 4 minutes. Required fields are marked with an asterisk.</p>
        </div>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-1">Full legal name<span className="text-danger font-semibold ml-0.5">*</span></div>
          <div className="text-muted text-ui mb-3.5">As it appears on your tax documents.</div>
          <input className="input" defaultValue="Avery Lin" />
        </FieldCard>

        <FieldCard error>
          <div className="text-question font-medium tracking-snug-xs mb-1">Work email<span className="text-danger font-semibold ml-0.5">*</span></div>
          <div className="text-muted text-ui mb-3.5">We'll send confirmation here.</div>
          <input className="input" defaultValue="avery@" />
          <div className="text-danger text-desc mt-2 flex items-center gap-1">{ICON_ALERT} Please enter a valid email address.</div>
        </FieldCard>

        <div className="mx-1 mt-7 mb-2">
          <h2 className="text-section font-semibold tracking-snug m-0 mb-1">Company details</h2>
          <p className="text-muted text-ui m-0">Tell us about your team so we can set up the right defaults.</p>
        </div>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-3">Plan tier<span className="text-danger font-semibold ml-0.5">*</span></div>
          <div className="tile-grid">
            <div className="tile">Starter</div>
            <div className="tile" data-selected="true">Growth</div>
            <div className="tile">Enterprise</div>
          </div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-1">Team size<span className="text-danger font-semibold ml-0.5">*</span></div>
          <div className="text-muted text-ui mb-3.5">Roughly how many people will use the workspace.</div>
          <div className="scale-row">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button key={n} className="scale-btn" data-selected={n === 4}>{n}</button>
            ))}
          </div>
          <div className="scale-endpoints"><span>Just me</span><span>Enterprise</span></div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-1">Estimated monthly seats</div>
          <div className="text-muted text-ui mb-3.5">Auto-calculated: team size × 1.4 (allowance for growth).</div>
          <div className="calc-result">
            <span className="num">5.6</span>
            <span className="formula">team_size × 1.4</span>
          </div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-3">How did you hear about us?</div>
          <div className="choice-list">
            <div className="choice-row"><span className="box" /> Search engine</div>
            <div className="choice-row" data-selected="true">
              <span className="box">{ICON_CHECK}</span> Referral from a colleague
            </div>
            <div className="choice-row"><span className="box" /> Podcast</div>
            <div className="choice-row" data-selected="true">
              <span className="box">{ICON_CHECK}</span>
              Other:
              <input className="input ml-2 h-7 flex-1" defaultValue="Friend at conference" />
            </div>
          </div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-3">How satisfied have you been with your current tool?</div>
          <div className="stars-row">
            {[1,2,3,4,5].map((n) => (
              <span key={n} className="star-btn" data-on={n <= 3}>{ICON_STAR}</span>
            ))}
          </div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-3">Phone (optional)</div>
          <div className="phone-row">
            <select className="select"><option>🇺🇸 +1</option></select>
            <input className="input" placeholder="(555) 123-4567" />
          </div>
        </FieldCard>

        <FieldCard>
          <div className="text-question font-medium tracking-snug-xs mb-1">Signature<span className="text-danger font-semibold ml-0.5">*</span></div>
          <div className="text-muted text-ui mb-3.5">By signing, you agree to our terms of service.</div>
          <div className="signature-pad" data-signed="true">
            <svg viewBox="0 0 600 140" preserveAspectRatio="none">
              <path
                d="M20 95 C 60 30, 90 110, 130 80 S 180 40, 220 90 S 280 110, 320 60 S 380 30, 420 90 S 480 100, 540 70"
                fill="none"
                stroke="oklch(0.18 0.005 270)"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-meta text-muted font-mono">Signed · stored locally as PNG</span>
            <Button variant="ghost" size="sm">Clear</Button>
          </div>
        </FieldCard>

        <div className="flex justify-between items-center gap-3 mt-6 flex-wrap">
          <div className="text-muted text-caption">Draft auto-saved · 11 of 14 answered</div>
          <div className="flex gap-2">
            <Button variant="secondary">Save &amp; exit</Button>
            <Button variant="primary" size="lg">Submit response</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
