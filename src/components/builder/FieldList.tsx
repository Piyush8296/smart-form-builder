import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FieldListItem } from './FieldListItem';
import type { FieldConfig } from '../../types/fields';

interface FieldListProps {
  fields: FieldConfig[];
  selectedFieldId: string | null;
  onSelect: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleRequired: (field: FieldConfig) => void;
  onMove: (from: number, to: number) => void;
}

export function FieldList({ fields, selectedFieldId, onSelect, onDuplicate, onDelete, onToggleRequired, onMove }: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = fields.findIndex((f) => f.id === active.id);
    const to = fields.findIndex((f) => f.id === over.id);
    if (from >= 0 && to >= 0) onMove(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        {fields.map((field) => (
          <FieldListItem
            key={field.id}
            field={field}
            selected={field.id === selectedFieldId}
            onSelect={() => onSelect(field.id)}
            onDuplicate={() => onDuplicate(field.id)}
            onDelete={() => onDelete(field.id)}
            onToggleRequired={() => onToggleRequired(field)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
