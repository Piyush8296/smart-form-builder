import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandle } from '../ui/DragHandle';
import { Button } from '../ui/Button';
import { getPlugin } from '../../registry';
import type { FieldConfig } from '../../types/fields';

interface FieldListItemProps {
  field: FieldConfig;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRequired: () => void;
}

const ICON_COPY = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ICON_TRASH = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

const ICON_BRANCH = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="3" r="2" /><circle cx="6" cy="21" r="2" /><circle cx="18" cy="12" r="2" />
    <path d="M6 5v6a4 4 0 0 0 4 4h6M6 13v6" />
  </svg>
);

const ICON_EYE = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

export function FieldListItem({ field, selected, onSelect, onDuplicate, onDelete, onToggleRequired }: FieldListItemProps) {
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
          {isHidden && <span className="chip">{ICON_EYE} Hidden</span>}
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
}
