import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConditionEditor } from './ConditionEditor';
import { FieldKind, ConditionOperator, ConditionEffect } from '../../enums';
import type { FieldConfig } from '../../types/fields';
import type { Condition } from '../../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTextField(id: string, label = 'Field'): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  } as FieldConfig;
}

function makeCondition(overrides: Partial<Condition> = {}): Condition {
  return {
    id: 'cond-1',
    targetFieldId: 'other-field',
    operator: ConditionOperator.EQUALS,
    value: 'foo',
    effect: ConditionEffect.SHOW,
    ...overrides,
  };
}

function getProps(overrides: Partial<{
  conditions: Condition[];
  allFields: FieldConfig[];
  currentFieldId: string;
  onChange: (conditions: Condition[]) => void;
}> = {}) {
  return {
    conditions: [],
    allFields: [makeTextField('current-field', 'Current'), makeTextField('other-field', 'Other')],
    currentFieldId: 'current-field',
    onChange: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ConditionEditor', () => {
  const user = userEvent.setup();

  beforeEach(() => { vi.clearAllMocks(); });

  describe('empty state', () => {
    it('shows the empty-state message when there are no conditions', () => {
      render(<ConditionEditor {...getProps()} />);
      expect(screen.getByText(/no conditions/i)).toBeInTheDocument();
    });

    it('renders an "Add condition" button', () => {
      render(<ConditionEditor {...getProps()} />);
      expect(screen.getByRole('button', { name: /add condition/i })).toBeInTheDocument();
    });

    it('disables "Add condition" when no eligible fields exist', () => {
      // Only the current field in allFields — no other eligible targets
      const props = getProps({
        allFields: [makeTextField('current-field')],
        currentFieldId: 'current-field',
      });
      render(<ConditionEditor {...props} />);
      expect(screen.getByRole('button', { name: /add condition/i })).toBeDisabled();
    });

    it('enables "Add condition" when at least one other field is eligible', () => {
      render(<ConditionEditor {...getProps()} />);
      expect(screen.getByRole('button', { name: /add condition/i })).toBeEnabled();
    });
  });

  describe('addCondition', () => {
    it('calls onChange with a new condition appended when "Add condition" is clicked', async () => {
      const onChange = vi.fn();
      render(<ConditionEditor {...getProps({ onChange })} />);

      await user.click(screen.getByRole('button', { name: /add condition/i }));

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions).toHaveLength(1);
    });

    it('the new condition defaults to EQUALS operator and SHOW effect', async () => {
      const onChange = vi.fn();
      render(<ConditionEditor {...getProps({ onChange })} />);

      await user.click(screen.getByRole('button', { name: /add condition/i }));

      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions[0].operator).toBe(ConditionOperator.EQUALS);
      expect(updatedConditions[0].effect).toBe(ConditionEffect.SHOW);
    });

    it('the new condition targets the first eligible field', async () => {
      const onChange = vi.fn();
      render(<ConditionEditor {...getProps({ onChange })} />);

      await user.click(screen.getByRole('button', { name: /add condition/i }));

      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions[0].targetFieldId).toBe('other-field');
    });

    it('does not include the current field in the dropdown options', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition()];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // The target field select shows only eligible fields
      const selects = screen.getAllByRole('combobox');
      // Second combobox in the condition row is the target-field selector
      const targetSelect = selects[1];
      expect(within(targetSelect).queryByText('Current')).toBeNull();
      expect(within(targetSelect).getByText('Other')).toBeInTheDocument();
    });
  });

  describe('removeCondition', () => {
    it('calls onChange with the condition removed when the delete button is clicked', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition({ id: 'cond-1' })];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // The delete button is an icon-only button — query by its position among all buttons
      // (all buttons except "Add condition" are delete buttons in a condition row)
      const allBtns = screen.getAllByRole('button');
      const deleteBtn = allBtns.find((b) => b !== screen.getByRole('button', { name: /add condition/i }))!;
      await user.click(deleteBtn);

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions).toHaveLength(0);
    });

    it('removes only the targeted condition when multiple conditions exist', async () => {
      const onChange = vi.fn();
      const conditions = [
        makeCondition({ id: 'cond-1', value: 'first' }),
        makeCondition({ id: 'cond-2', value: 'second' }),
      ];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // Collect all buttons; the first two (non-Add-condition) are delete buttons
      const allBtns = screen.getAllByRole('button');
      const addBtn = screen.getByRole('button', { name: /add condition/i });
      const deleteBtns = allBtns.filter((b) => b !== addBtn);
      await user.click(deleteBtns[0]);

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions).toHaveLength(1);
      expect(updatedConditions[0].id).toBe('cond-2');
    });
  });

  describe('updateCondition — effect', () => {
    it('calls onChange with updated effect when the effect select changes', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition({ effect: ConditionEffect.SHOW })];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // First combobox in the condition row is the effect selector
      const effectSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(effectSelect, ConditionEffect.HIDE);

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions[0].effect).toBe(ConditionEffect.HIDE);
    });
  });

  describe('updateCondition — operator', () => {
    it('calls onChange with updated operator when the operator select changes', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition({ operator: ConditionOperator.EQUALS })];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // Third combobox in the condition row is the operator selector
      const operatorSelect = screen.getAllByRole('combobox')[2];
      await user.selectOptions(operatorSelect, ConditionOperator.CONTAINS);

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions[0].operator).toBe(ConditionOperator.CONTAINS);
    });

    it('hides the value input for valueless operators (IS_EMPTY, IS_NOT_EMPTY)', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition({ operator: ConditionOperator.IS_EMPTY, value: '' })];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // Value input should not be present for IS_EMPTY
      expect(screen.queryByPlaceholderText(/value/i)).not.toBeInTheDocument();
    });

    it('shows the value input for operators that require a value', () => {
      const conditions = [makeCondition({ operator: ConditionOperator.EQUALS, value: 'test' })];
      render(<ConditionEditor {...getProps({ conditions })} />);
      expect(screen.getByPlaceholderText(/value/i)).toBeInTheDocument();
    });
  });

  describe('updateCondition — value', () => {
    it('calls onChange when the user types in the value input', async () => {
      const onChange = vi.fn();
      const conditions = [makeCondition({ operator: ConditionOperator.EQUALS, value: '' })];
      render(<ConditionEditor {...getProps({ conditions, onChange })} />);

      // ConditionEditor is fully controlled — onChange fires on each keystroke
      // Each call passes the full conditions array with the new value
      const valueInput = screen.getByPlaceholderText(/value/i);
      await user.type(valueInput, 'x');

      expect(onChange).toHaveBeenCalledOnce();
      const [updatedConditions] = onChange.mock.calls[0] as [Condition[]];
      expect(updatedConditions[0].value).toBe('x');
    });
  });

  describe('multiple conditions', () => {
    it('renders a row for each condition', () => {
      const conditions = [
        makeCondition({ id: 'cond-1' }),
        makeCondition({ id: 'cond-2' }),
      ];
      render(<ConditionEditor {...getProps({ conditions })} />);

      // Each condition has an icon-only delete button; total buttons = 2 delete + 1 Add condition
      const allBtns = screen.getAllByRole('button');
      const addBtn = screen.getByRole('button', { name: /add condition/i });
      const deleteBtns = allBtns.filter((b) => b !== addBtn);
      expect(deleteBtns).toHaveLength(2);
    });

    it('does not show the empty-state message when conditions exist', () => {
      const conditions = [makeCondition()];
      render(<ConditionEditor {...getProps({ conditions })} />);
      expect(screen.queryByText(/no conditions/i)).not.toBeInTheDocument();
    });
  });
});
