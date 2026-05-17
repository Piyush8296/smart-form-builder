import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { ConditionOperator, ConditionEffect } from '../../enums';
import type { FieldConfig } from '../../types/fields';
import type { Condition } from '../../types/conditions';
import { generateId } from '../../utils/id';
import { OPERATORS, EFFECTS, VALUELESS_OPS } from '../../constants/conditions';
import { ICON_BRANCH, ICON_PLUS, ICON_TRASH } from '../../constants/icons';

interface ConditionEditorProps {
  conditions: Condition[];
  allFields: FieldConfig[];
  currentFieldId: string;
  onChange: (conditions: Condition[]) => void;
}

export function ConditionEditor({ conditions, allFields, currentFieldId, onChange }: ConditionEditorProps) {
  const eligibleFields = allFields.filter((f) => f.id !== currentFieldId);

  function addCondition() {
    if (eligibleFields.length === 0) return;
    const newCond: Condition = {
      id: generateId(),
      targetFieldId: eligibleFields[0].id,
      operator: ConditionOperator.EQUALS,
      value: '',
      effect: ConditionEffect.SHOW,
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
          {!VALUELESS_OPS.includes(cond.operator) && (
            <Input
              className="h-7 text-caption"
              value={typeof cond.value === 'string' ? cond.value : String(cond.value ?? '')}
              placeholder="Value…"
              onChange={(e) => updateCondition(cond.id, { value: e.target.value })}
            />
          )}
          <div className="flex justify-end">
            <Button variant="danger-ghost" size="sm" icon aria-label="Delete condition" onClick={() => removeCondition(cond.id)}>
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
