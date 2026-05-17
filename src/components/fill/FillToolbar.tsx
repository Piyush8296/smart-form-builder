import { memo } from 'react';
import { Button } from '../ui/Button';
import { ICON_ALERT } from '../../constants/icons';

interface FillToolbarProps {
  answeredCount: number;
  totalVisible: number;
  onSubmit: () => void;
  onSaveExit?: () => void;
  submitError: string | null;
  hasDraft: boolean;
}

export const FillToolbar = memo(function FillToolbar({
  answeredCount,
  totalVisible,
  onSubmit,
  onSaveExit,
  submitError,
  hasDraft,
}: FillToolbarProps) {
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
});
