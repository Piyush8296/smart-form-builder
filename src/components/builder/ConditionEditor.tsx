import { memo } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { ConditionOperator, ConditionEffect, FieldKind } from '../../enums';
import type { FieldConfig, MultiSelectConfig, SingleSelectConfig } from '../../types/fields';
import type { Condition } from '../../types/conditions';
import { generateId } from '../../utils/id';
import {
  OPERATORS, EFFECTS, VALUELESS_OPS, MULTI_VALUE_OPS,
  OPERATORS_BY_KIND, DEFAULT_OPERATORS,
} from '../../constants/conditions';
import { ICON_BRANCH, ICON_PLUS, ICON_TRASH } from '../../constants/icons';

interface ConditionEditorProps {
  conditions: Condition[];
  allFields: FieldConfig[];
  currentFieldId: string;
  onChange: (conditions: Condition[]) => void;
}

function getOperatorsForKind(kind: FieldKind): readonly ConditionOperator[] {
  return OPERATORS_BY_KIND[kind] ?? DEFAULT_OPERATORS;
}

function hasOptions(field: FieldConfig): field is SingleSelectConfig | MultiSelectConfig {
  return field.kind === FieldKind.SINGLE_SELECT || field.kind === FieldKind.MULTI_SELECT;
}

function ValueInput({
  cond,
  targetField,
  onValueChange,
}: {
  cond: Condition;
  targetField: FieldConfig | undefined;
  onValueChange: (patch: Partial<Condition>) => void;
}) {
  if (VALUELESS_OPS.includes(cond.operator)) return null;

  if (cond.operator === ConditionOperator.IS_WITHIN_RANGE) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <Input
          type="number"
          className="h-7 text-caption"
          placeholder="Min"
          value={typeof cond.value === 'number' ? String(cond.value) : ''}
          onChange={(e) => onValueChange({ value: e.target.value === '' ? null : Number(e.target.value) })}
        />
        <Input
          type="number"
          className="h-7 text-caption"
          placeholder="Max"
          value={typeof cond.value2 === 'number' ? String(cond.value2) : ''}
          onChange={(e) => onValueChange({ value2: e.target.value === '' ? null : Number(e.target.value) })}
        />
      </div>
    );
  }

  if (MULTI_VALUE_OPS.includes(cond.operator) && targetField && hasOptions(targetField)) {
    const selected = cond.value ? String(cond.value).split(',').filter(Boolean) : [];
    return (
      <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pl-0.5">
        {targetField.options.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2 text-caption cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-accent"
              checked={selected.includes(opt.id)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...selected, opt.id]
                  : selected.filter((s) => s !== opt.id);
                onValueChange({ value: next.join(',') });
              }}
            />
            {opt.label || opt.id}
          </label>
        ))}
        {targetField.options.length === 0 && (
          <p className="text-caption text-muted">No options defined yet.</p>
        )}
      </div>
    );
  }

  if (targetField?.kind === FieldKind.DATE || cond.operator === ConditionOperator.IS_BEFORE || cond.operator === ConditionOperator.IS_AFTER) {
    return (
      <Input
        type="date"
        className="h-7 text-caption"
        value={typeof cond.value === 'string' ? cond.value : ''}
        onChange={(e) => onValueChange({ value: e.target.value })}
      />
    );
  }

  const isNumericOp = cond.operator === ConditionOperator.GREATER_THAN || cond.operator === ConditionOperator.LESS_THAN;
  const isNumericTarget = targetField?.kind === FieldKind.NUMBER || targetField?.kind === FieldKind.RATING || targetField?.kind === FieldKind.LINEAR_SCALE;

  if (isNumericOp || isNumericTarget) {
    return (
      <Input
        type="number"
        className="h-7 text-caption"
        value={typeof cond.value === 'number' ? String(cond.value) : ''}
        placeholder="Value…"
        onChange={(e) => onValueChange({ value: e.target.value === '' ? null : Number(e.target.value) })}
      />
    );
  }

  return (
    <Input
      className="h-7 text-caption"
      value={typeof cond.value === 'string' ? cond.value : String(cond.value ?? '')}
      placeholder="Value…"
      onChange={(e) => onValueChange({ value: e.target.value })}
    />
  );
}

export const ConditionEditor = memo(function ConditionEditor({
  conditions,
  allFields,
  currentFieldId,
  onChange,
}: ConditionEditorProps) {
  const eligibleFields = allFields.filter((f) => f.id !== currentFieldId);

  function addCondition() {
    if (eligibleFields.length === 0) return;
    const firstField = eligibleFields[0];
    const ops = getOperatorsForKind(firstField.kind);
    const newCond: Condition = {
      id: generateId(),
      targetFieldId: firstField.id,
      operator: ops[0],
      value: null,
      effect: ConditionEffect.SHOW,
    };
    onChange([...conditions, newCond]);
  }

  function updateCondition(id: string, patch: Partial<Condition>) {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleTargetChange(cond: Condition, newTargetId: string) {
    const targetField = allFields.find((f) => f.id === newTargetId);
    const ops = targetField ? getOperatorsForKind(targetField.kind) : DEFAULT_OPERATORS;
    const validOp = (ops as ConditionOperator[]).includes(cond.operator) ? cond.operator : ops[0];
    updateCondition(cond.id, { targetFieldId: newTargetId, operator: validOp, value: null, value2: null });
  }

  function handleOperatorChange(cond: Condition, newOp: ConditionOperator) {
    updateCondition(cond.id, { operator: newOp, value: null, value2: null });
  }

  function removeCondition(id: string) {
    onChange(conditions.filter((c) => c.id !== id));
  }

  return (
    <div>
      {conditions.length === 0 && (
        <p className="text-caption text-muted mb-3">No conditions — this field always follows its default visibility.</p>
      )}
      {conditions.map((cond) => {
        const targetField = allFields.find((f) => f.id === cond.targetFieldId);
        const availableOps = targetField ? getOperatorsForKind(targetField.kind) : DEFAULT_OPERATORS;
        const opLabels = OPERATORS.filter((o) => (availableOps as ConditionOperator[]).includes(o.value));

        return (
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
              onChange={(e) => handleTargetChange(cond, e.target.value)}
            >
              {eligibleFields.map((f) => <option key={f.id} value={f.id}>{f.label || f.id}</option>)}
            </Select>
            <Select
              className="h-7 text-caption"
              value={cond.operator}
              onChange={(e) => handleOperatorChange(cond, e.target.value as ConditionOperator)}
            >
              {opLabels.map((op) => <option key={op.value} value={op.value}>{op.label}</option>)}
            </Select>
            <ValueInput
              cond={cond}
              targetField={targetField}
              onValueChange={(patch) => updateCondition(cond.id, patch)}
            />
            <div className="flex justify-end">
              <Button variant="danger-ghost" size="sm" icon aria-label="Delete condition" onClick={() => removeCondition(cond.id)}>
                {ICON_TRASH}
              </Button>
            </div>
          </div>
        );
      })}
      <Button variant="ghost" size="sm" onClick={addCondition} disabled={eligibleFields.length === 0}>
        {ICON_PLUS} Add condition
      </Button>
    </div>
  );
});
