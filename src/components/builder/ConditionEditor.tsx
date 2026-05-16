import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import type { FieldConfig } from '../../types/fields';
import type { Condition, ConditionOperator, ConditionEffect } from '../../types/conditions';
import { generateId } from '../../utils/id';

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

const EFFECTS: { value: ConditionEffect; label: string }[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'require', label: 'Require' },
  { value: 'unrequire', label: 'Un-require' },
];

const valuelessOps: ConditionOperator[] = ['is_empty', 'is_not_empty'];

interface ConditionEditorProps {
  conditions: Condition[];
  allFields: FieldConfig[];
  currentFieldId: string;
  onChange: (conditions: Condition[]) => void;
}

const ICON_BRANCH = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="3" r="2" /><circle cx="6" cy="21" r="2" /><circle cx="18" cy="12" r="2" />
    <path d="M6 5v6a4 4 0 0 0 4 4h6M6 13v6" />
  </svg>
);

const ICON_PLUS = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ICON_TRASH = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export function ConditionEditor({ conditions, allFields, currentFieldId, onChange }: ConditionEditorProps) {
  const eligibleFields = allFields.filter((f) => f.id !== currentFieldId);

  function addCondition() {
    if (eligibleFields.length === 0) return;
    const newCond: Condition = {
      id: generateId(),
      targetFieldId: eligibleFields[0].id,
      operator: 'equals',
      value: '',
      effect: 'show',
    };
    onChange([...conditions, newCond]);
  }

  function updateCondition(id: string, patch: Partial<Condition>) {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function removeCondition(id: string) {
    onChange(conditions.filter((c) => c.id !== id));
  }

  return (
    <div>
      {conditions.length === 0 && (
        <p className="text-caption text-muted mb-3">No conditions — this field always follows its default visibility.</p>
      )}
      {conditions.map((cond) => (
        <div key={cond.id} className="bg-surface-2 border border-border rounded-md p-2.5 grid gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-caption text-ink-2">
            {ICON_BRANCH}
            <Select
              className="h-7 text-caption flex-1"
              value={cond.effect}
              onChange={(e) => updateCondition(cond.id, { effect: e.target.value as ConditionEffect })}
            >
              {EFFECTS.map((ef) => <option key={ef.value} value={ef.value}>{ef.label}</option>)}
            </Select>
            <span className="text-muted shrink-0">this field when…</span>
          </div>
          <Select
            className="h-7 text-caption"
            value={cond.targetFieldId}
            onChange={(e) => updateCondition(cond.id, { targetFieldId: e.target.value })}
          >
            {eligibleFields.map((f) => <option key={f.id} value={f.id}>{f.label || f.id}</option>)}
          </Select>
          <Select
            className="h-7 text-caption"
            value={cond.operator}
            onChange={(e) => updateCondition(cond.id, { operator: e.target.value as ConditionOperator })}
          >
            {OPERATORS.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
          </Select>
          {!valuelessOps.includes(cond.operator) && (
            <Input
              className="h-7 text-caption"
              value={typeof cond.value === 'string' ? cond.value : String(cond.value ?? '')}
              placeholder="Value…"
              onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
            />
          )}
          <div className="flex justify-end">
            <Button variant="danger-ghost" size="sm" icon onClick={() => removeCondition(cond.id)}>
              {ICON_TRASH}
            </Button>
          </div>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addCondition} disabled={eligibleFields.length === 0}>
        {ICON_PLUS} Add condition
      </Button>
    </div>
  );
}
