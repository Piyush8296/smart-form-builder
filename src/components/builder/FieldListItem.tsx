import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '../ui/DragHandle';
import { Button } from '../ui/Button';
import { getPlugin } from '../../registry';
import type { FieldConfig } from '../../types/fields';
import { ICON_COPY, ICON_TRASH, ICON_BRANCH, ICON_EYE_SM } from '../../constants/icons';

interface FieldListItemProps {
  field: FieldConfig;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRequired: () => void;
}

export const FieldListItem = memo(function FieldListItem({
  field,
  selected,
  onSelect,
  onDuplicate,
  onDelete,
  onToggleRequired,
}: FieldListItemProps) {
  const plugin = getPlugin(field.kind);
  const hasConditions = field.conditions.length > 0;
  const isHidden = !field.defaultVisible;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/field bg-surface border border-border rounded-lg mb-2.5 relative transition-colors hover:border-border-strong data-[selected=true]:border-ink data-[selected=true]:shadow-focus-accent data-[hidden=true]:opacity-55"
      data-selected={selected}
      data-hidden={isHidden || undefined}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
    >
      <span className="absolute top-3.5 -left-5.5 text-muted-2 opacity-0 transition-opacity group-hover/field:opacity-100 group-data-[selected=true]/field:opacity-100">
        <DragHandle listeners={listeners} attributes={attributes} />
      </span>
      <div className="px-5 py-4 max-mob:px-3.5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-sm font-medium text-ink">
            {field.label || <em className="text-muted">(no label)</em>}
            {field.defaultRequired && <span className="text-danger font-semibold ml-0.5">*</span>}
          </span>
          {isHidden && <span className="chip">{ICON_EYE_SM} Hidden</span>}
          {hasConditions && <span className="chip chip-accent">{ICON_BRANCH} Conditional</span>}
        </div>
        {field.description && (
          <div className="text-muted text-desc mb-2 line-clamp-1">{field.description}</div>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-divider px-4 py-2 gap-3 flex-wrap max-mob:px-3">
        <span className="font-mono text-label text-muted">
          {plugin.displayName}
          {field.defaultRequired && <> · required</>}
        </span>
        <div className="flex gap-0.5 ml-auto" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" icon title="Duplicate" onClick={onDuplicate}>{ICON_COPY}</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRequired}
            title={field.defaultRequired ? 'Mark optional' : 'Mark required'}
          >
            Required
            <span className="toggle ml-1.5" data-on={field.defaultRequired} aria-hidden="true" />
          </Button>
          <Button variant="danger-ghost" size="sm" icon title="Delete" onClick={onDelete}>{ICON_TRASH}</Button>
        </div>
      </div>
    </div>
  );
});
