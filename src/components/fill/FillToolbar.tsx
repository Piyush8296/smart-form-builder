import { Button } from '../ui/Button';

interface FillToolbarProps {
  answeredCount: number;
  totalVisible: number;
  onSubmit: () => void;
  onSaveExit?: () => void;
  submitError: string | null;
  hasDraft: boolean;
}

const ICON_ALERT = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
  </svg>
);

export function FillToolbar({ answeredCount, totalVisible, onSubmit, onSaveExit, submitError, hasDraft }: FillToolbarProps) {
  return (
    <div className="mt-6">
      {submitError && (
        <div className="flex items-center gap-2 text-danger text-desc mb-3 bg-surface border border-danger rounded-md px-3 py-2">
          {ICON_ALERT} {submitError}
        </div>
      )}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div className="text-muted text-caption">
          {hasDraft ? 'Draft auto-saved · ' : ''}{answeredCount} of {totalVisible} answered
        </div>
        <div className="flex gap-2">
          {onSaveExit && (
            <Button variant="secondary" onClick={onSaveExit}>Save &amp; exit</Button>
          )}
          <Button variant="primary" size="lg" onClick={onSubmit}>Submit response</Button>
        </div>
      </div>
    </div>
  );
}
