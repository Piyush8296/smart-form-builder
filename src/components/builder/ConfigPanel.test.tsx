import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigPanel } from './ConfigPanel';
import { BuilderTab, FieldKind } from '../../enums';
import type { FieldConfig, TextSingleConfig } from '../../types/fields';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTextField(overrides: Partial<TextSingleConfig> = {}): TextSingleConfig {
  return {
    id: 'field-1',
    kind: FieldKind.TEXT_SINGLE,
    label: 'My Label',
    description: '',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  } as TextSingleConfig;
}

function getProps(overrides: {
  field?: FieldConfig;
  allFields?: FieldConfig[];
  onChange?: (f: FieldConfig) => void;
} = {}) {
  const field = overrides.field ?? makeTextField();
  return {
    field,
    allFields: overrides.allFields ?? [field],
    onChange: overrides.onChange ?? vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ConfigPanel', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Tab rendering
  // ---------------------------------------------------------------------------
  describe('tabs', () => {
    it('renders all three tab buttons', () => {
      render(<ConfigPanel {...getProps()} />);
      expect(screen.getByRole('button', { name: BuilderTab.FIELD })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: BuilderTab.LOGIC })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: BuilderTab.VALIDATION })).toBeInTheDocument();
    });

    it('shows Field tab content by default', () => {
      render(<ConfigPanel {...getProps()} />);
      // The text-single ConfigEditor renders a "Label" form label — there may be multiple /label/i matches
      expect(screen.getAllByText(/label/i).length).toBeGreaterThan(0);
    });

    it('switches to Logic tab when clicked', async () => {
      render(<ConfigPanel {...getProps()} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.LOGIC }));
      // "Conditions" heading text appears exactly when the Logic tab is shown
      expect(screen.getByText('Conditions')).toBeInTheDocument();
    });

    it('switches to Validation tab when clicked', async () => {
      render(<ConfigPanel {...getProps()} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it('marks the active tab with data-active=true', async () => {
      render(<ConfigPanel {...getProps()} />);
      const fieldTab = screen.getByRole('button', { name: BuilderTab.FIELD });
      expect(fieldTab.dataset.active).toBe('true');

      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      expect(screen.getByRole('button', { name: BuilderTab.VALIDATION }).dataset.active).toBe('true');
      expect(fieldTab.dataset.active).toBe('false');
    });
  });

  // ---------------------------------------------------------------------------
  // Field tab — ConfigEditor interaction
  // ---------------------------------------------------------------------------
  describe('Field tab — label edit', () => {
    it('displays the plugin displayName and current field label in the header', () => {
      render(<ConfigPanel {...getProps({ field: makeTextField({ label: 'First name' }) })} />);
      // The header includes `plugin.displayName · field.label`
      expect(screen.getByText(/short text/i)).toBeInTheDocument();
      expect(screen.getByText(/first name/i)).toBeInTheDocument();
    });

    it('shows (no label) in the header when field label is empty', () => {
      render(<ConfigPanel {...getProps({ field: makeTextField({ label: '' }) })} />);
      expect(screen.getByText(/no label/i)).toBeInTheDocument();
    });

    it('calls onChange with the updated label when the user edits the Label input', async () => {
      const onChange = vi.fn();
      // ConfigPanel is fully controlled — it forwards the field prop directly to the plugin's
      // ConfigEditor. Each onChange call receives the config with just the character typed
      // (the label reflects the prop value + the new char). We type a single character so
      // the expected label value is unambiguous.
      render(<ConfigPanel {...getProps({ field: makeTextField({ label: '' }), onChange })} />);

      const labelInput = screen.getAllByRole('textbox')[0];
      await user.type(labelInput, 'A');

      expect(onChange).toHaveBeenCalledOnce();
      const updated = onChange.mock.calls[0][0] as FieldConfig;
      expect(updated.label).toBe('A');
    });

    it('calls onChange with updated description when description input changes', async () => {
      const onChange = vi.fn();
      render(<ConfigPanel {...getProps({ onChange })} />);

      const inputs = screen.getAllByRole('textbox');
      // Second input in the text-single ConfigEditor is "Description"
      await user.clear(inputs[1]);
      await user.type(inputs[1], 'Helpful hint');

      expect(onChange).toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Validation tab — Required / Visible toggles
  //
  // NOTE: Toggle renders a role="switch" span with no accessible name — the label
  // text is a sibling div, not an aria-label. We locate the two switches by
  // their rendered order: index 0 = Required, index 1 = Visible by default.
  // ---------------------------------------------------------------------------
  describe('Validation tab — required toggle', () => {
    it('shows two switches when Validation tab is active', async () => {
      render(<ConfigPanel {...getProps()} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      expect(screen.getAllByRole('switch')).toHaveLength(2);
    });

    it('Required switch reflects defaultRequired=false', async () => {
      render(<ConfigPanel {...getProps({ field: makeTextField({ defaultRequired: false }) })} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));

      const [requiredSwitch] = screen.getAllByRole('switch');
      expect(requiredSwitch).toHaveAttribute('aria-checked', 'false');
    });

    it('calls onChange with defaultRequired toggled on when Required switch is clicked', async () => {
      const onChange = vi.fn();
      render(<ConfigPanel {...getProps({ field: makeTextField({ defaultRequired: false }), onChange })} />);

      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      const [requiredSwitch] = screen.getAllByRole('switch');
      await user.click(requiredSwitch);

      expect(onChange).toHaveBeenCalledOnce();
      const updated = onChange.mock.calls[0][0] as FieldConfig;
      expect(updated.defaultRequired).toBe(true);
    });

    it('calls onChange with defaultRequired toggled off when Required switch is clicked while on', async () => {
      const onChange = vi.fn();
      render(<ConfigPanel {...getProps({ field: makeTextField({ defaultRequired: true }), onChange })} />);

      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      const [requiredSwitch] = screen.getAllByRole('switch');
      await user.click(requiredSwitch);

      expect(onChange).toHaveBeenCalledOnce();
      const updated = onChange.mock.calls[0][0] as FieldConfig;
      expect(updated.defaultRequired).toBe(false);
    });
  });

  describe('Validation tab — visible by default toggle', () => {
    it('Visible switch reflects defaultVisible=true', async () => {
      render(<ConfigPanel {...getProps({ field: makeTextField({ defaultVisible: true }) })} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));

      const [, visibleSwitch] = screen.getAllByRole('switch');
      expect(visibleSwitch).toHaveAttribute('aria-checked', 'true');
    });

    it('calls onChange with defaultVisible toggled when the Visible switch is clicked', async () => {
      const onChange = vi.fn();
      render(<ConfigPanel {...getProps({ field: makeTextField({ defaultVisible: true }), onChange })} />);

      await user.click(screen.getByRole('button', { name: BuilderTab.VALIDATION }));
      const [, visibleSwitch] = screen.getAllByRole('switch');
      await user.click(visibleSwitch);

      expect(onChange).toHaveBeenCalledOnce();
      const updated = onChange.mock.calls[0][0] as FieldConfig;
      expect(updated.defaultVisible).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Logic tab — delegates to ConditionEditor
  // ---------------------------------------------------------------------------
  describe('Logic tab', () => {
    it('shows the Conditions heading', async () => {
      render(<ConfigPanel {...getProps()} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.LOGIC }));
      expect(screen.getByText('Conditions')).toBeInTheDocument();
    });

    it('shows the empty-state message from ConditionEditor when field has no conditions', async () => {
      render(<ConfigPanel {...getProps()} />);
      await user.click(screen.getByRole('button', { name: BuilderTab.LOGIC }));
      expect(screen.getByText(/no conditions/i)).toBeInTheDocument();
    });

    it('calls onChange with updated conditions when ConditionEditor fires', async () => {
      const onChange = vi.fn();
      const field = makeTextField({ conditions: [] });
      // Provide a second field so the "Add condition" button is enabled
      const otherField = makeTextField({ id: 'field-2', label: 'Other' });
      render(<ConfigPanel {...getProps({ field, allFields: [field, otherField], onChange })} />);

      await user.click(screen.getByRole('button', { name: BuilderTab.LOGIC }));
      await user.click(screen.getByRole('button', { name: /add condition/i }));

      expect(onChange).toHaveBeenCalledOnce();
      const updated = onChange.mock.calls[0][0] as FieldConfig;
      expect(updated.conditions).toHaveLength(1);
    });
  });
});
