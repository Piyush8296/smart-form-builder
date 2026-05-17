import { Brand } from '../ui/Brand';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ICON_SETTINGS, ICON_EYE } from '../../constants/icons';

interface BuilderToolbarProps {
  title: string;
  hasUnsavedChanges: boolean;
  onTitleChange: (title: string) => void;
  onSettings: () => void;
  onPreview: () => void;
  templateId: string;
}

export function BuilderToolbar({ title, hasUnsavedChanges, onTitleChange, onSettings, onPreview, templateId }: BuilderToolbarProps) {
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
            {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
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
