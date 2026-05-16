import { Brand } from '../ui/Brand';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface BuilderToolbarProps {
  title: string;
  isDirty: boolean;
  onTitleChange: (title: string) => void;
  onSettings: () => void;
  onPreview: () => void;
  templateId: string;
}

const ICON_SETTINGS = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

const ICON_EYE = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

export function BuilderToolbar({ title, isDirty, onTitleChange, onSettings, onPreview, templateId }: BuilderToolbarProps) {
  return (
    <header className="h-14 border-b border-border topbar-glass z-40 flex items-center px-5 flex-none">
      <div className="flex items-center gap-3 w-full max-w-app mx-auto">
        <Brand nameHidden />
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Input
            className="bg-transparent border border-transparent rounded-md py-1 px-2 w-full max-w-form-title text-sm font-medium tracking-snug-xs hover:bg-surface-2 focus:bg-surface focus:border-border"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Untitled form"
          />
          <span className="text-muted text-caption font-mono whitespace-nowrap">
            {isDirty ? 'Unsaved changes' : 'Saved'}
          </span>
        </div>
        <Button variant="ghost" size="sm" icon title="Settings" onClick={onSettings}>
          {ICON_SETTINGS}
        </Button>
        <Button variant="secondary" size="sm" onClick={onPreview}>
          {ICON_EYE} Preview
        </Button>
        <a
          href={`/fill/${templateId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          Open form
        </a>
      </div>
    </header>
  );
}
