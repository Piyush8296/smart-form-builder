import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';

import { textSinglePlugin } from './text-single';
import { textMultiPlugin } from './text-multi';
import { numberPlugin } from './number';
import { datePlugin } from './date';
import { timePlugin } from './time';
import { emailPlugin } from './email';
import { urlPlugin } from './url';
import { phonePlugin } from './phone';
import { singleSelectPlugin } from './single-select';
import { multiSelectPlugin } from './multi-select';
import { ratingPlugin } from './rating';
import { linearScalePlugin } from './linear-scale';
import { fileUploadPlugin } from './file-upload';
import { signaturePlugin } from './signature';
import { addressPlugin } from './address';
import { calculationPlugin } from './calculation';
import { sectionHeaderPlugin } from './section-header';

import {
  FieldKind,
  SingleSelectVariant,
  CalculationOperation,
  SectionHeaderSize,
} from '../enums';
import type { Condition } from '../types/conditions';
import type {
  TextSingleConfig,
  TextMultiConfig,
  NumberConfig,
  DateConfig,
  TimeConfig,
  EmailConfig,
  UrlConfig,
  PhoneConfig,
  SingleSelectConfig,
  MultiSelectConfig,
  RatingConfig,
  LinearScaleConfig,
  FileUploadConfig,
  SignatureConfig,
  AddressConfig,
  CalculationConfig,
  SectionHeaderConfig,
} from '../types/fields';

// ---------------------------------------------------------------------------
// Shared base for all configs
// ---------------------------------------------------------------------------

const BASE = {
  id: 'test-field',
  conditions: [] as Condition[],
  defaultVisible: true,
  defaultRequired: false,
};

// ---------------------------------------------------------------------------
// TEXT_SINGLE ConfigEditor
// ---------------------------------------------------------------------------

describe('textSinglePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<TextSingleConfig> = {}): TextSingleConfig => ({
    ...BASE,
    kind: FieldKind.TEXT_SINGLE,
    label: 'My label',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = textSinglePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('displays the current label value', () => {
    const { ConfigEditor } = textSinglePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Full Name' }), onChange: vi.fn(), allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    // First input is the Label field
    expect((inputs[0] as HTMLInputElement).value).toBe('Full Name');
  });

  it('calls onChange with updated label when user types', async () => {
    const { ConfigEditor } = textSinglePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    await user.type(labelInput, 'A');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'A' }));
  });

  it('calls onChange with updated description', async () => {
    const { ConfigEditor } = textSinglePlugin;
    const onChange = vi.fn();
    const config = makeConfig();
    render(React.createElement(ConfigEditor, { config, onChange, allFields: [] }));
    // Description is the second text input. Type a single char — the component is
    // controlled (value={config.description ?? ''}) so each keystroke calls onChange
    // with the one character against the unchanged config.
    const descInput = screen.getAllByRole('textbox')[1];
    await user.type(descInput, 'h');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ description: 'h' }));
  });

  it('renders prefix, suffix, placeholder, default value, validation regex inputs', () => {
    const { ConfigEditor } = textSinglePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    // There are 8 text inputs: label, description, prefix, suffix, placeholder, default value, validation regex, validation message
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(6);
  });
});

// ---------------------------------------------------------------------------
// TEXT_MULTI ConfigEditor
// ---------------------------------------------------------------------------

describe('textMultiPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<TextMultiConfig> = {}): TextMultiConfig => ({
    ...BASE,
    kind: FieldKind.TEXT_MULTI,
    label: 'Paragraph',
    rows: 4,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = textMultiPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('displays the current label', () => {
    const { ConfigEditor } = textMultiPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Bio' }), onChange: vi.fn(), allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    expect((inputs[0] as HTMLInputElement).value).toBe('Bio');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = textMultiPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'Z');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'Z' }));
  });

  it('renders a rows number input', () => {
    const { ConfigEditor } = textMultiPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ rows: 6 }), onChange: vi.fn(), allFields: [] }));
    const spinners = screen.getAllByRole('spinbutton');
    // First spinbutton is Rows
    expect((spinners[0] as HTMLInputElement).value).toBe('6');
  });

  it('calls onChange with updated rows', () => {
    const { ConfigEditor } = textMultiPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ rows: 4 }), onChange, allFields: [] }));
    const rowsInput = screen.getAllByRole('spinbutton')[0];
    // Use fireEvent to simulate a direct change on the controlled number input
    fireEvent.change(rowsInput, { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ rows: 8 }));
  });
});

// ---------------------------------------------------------------------------
// NUMBER ConfigEditor
// ---------------------------------------------------------------------------

describe('numberPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<NumberConfig> = {}): NumberConfig => ({
    ...BASE,
    kind: FieldKind.NUMBER,
    label: 'Quantity',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = numberPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label input with current value', () => {
    const { ConfigEditor } = numberPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Price' }), onChange: vi.fn(), allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Price');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = numberPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'N');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'N' }));
  });

  it('renders min, max, decimal places, step spinbuttons', () => {
    const { ConfigEditor } = numberPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    // min, max, decimalPlaces, step = 4 spinbuttons
    expect(screen.getAllByRole('spinbutton').length).toBe(4);
  });

  it('calls onChange with min value when typed', () => {
    const { ConfigEditor } = numberPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    const [minInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(minInput, { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ min: 5 }));
  });
});

// ---------------------------------------------------------------------------
// DATE ConfigEditor
// ---------------------------------------------------------------------------

describe('datePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<DateConfig> = {}): DateConfig => ({
    ...BASE,
    kind: FieldKind.DATE,
    label: 'Date',
    prefillToday: false,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = datePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows the label input', () => {
    const { ConfigEditor } = datePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Birth date' }), onChange: vi.fn(), allFields: [] }));
    // Label input is the first textbox
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Birth date');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = datePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'D');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'D' }));
  });

  it('shows error message when minDate is after maxDate', () => {
    const { ConfigEditor } = datePlugin;
    render(React.createElement(ConfigEditor, {
      config: makeConfig({ minDate: '2025-06-01', maxDate: '2025-01-01' }),
      onChange: vi.fn(),
      allFields: [],
    }));
    expect(screen.getByText(/min date must be before max date/i)).toBeInTheDocument();
  });

  it('does not show date error when minDate <= maxDate', () => {
    const { ConfigEditor } = datePlugin;
    render(React.createElement(ConfigEditor, {
      config: makeConfig({ minDate: '2025-01-01', maxDate: '2025-06-01' }),
      onChange: vi.fn(),
      allFields: [],
    }));
    expect(screen.queryByText(/min date must be before max date/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TIME ConfigEditor
// ---------------------------------------------------------------------------

describe('timePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<TimeConfig> = {}): TimeConfig => ({
    ...BASE,
    kind: FieldKind.TIME,
    label: 'Time',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = timePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = timePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'T');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'T' }));
  });
});

// ---------------------------------------------------------------------------
// EMAIL ConfigEditor
// ---------------------------------------------------------------------------

describe('emailPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<EmailConfig> = {}): EmailConfig => ({
    ...BASE,
    kind: FieldKind.EMAIL,
    label: 'Email',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = emailPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label, description, placeholder, validation message inputs', () => {
    const { ConfigEditor } = emailPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(4);
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = emailPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'E');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'E' }));
  });

  it('calls onChange with updated validation message', () => {
    const { ConfigEditor } = emailPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    const valMsgInput = screen.getAllByRole('textbox')[3];
    fireEvent.change(valMsgInput, { target: { value: 'Bad email' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ validationMessage: 'Bad email' }));
  });
});

// ---------------------------------------------------------------------------
// URL ConfigEditor
// ---------------------------------------------------------------------------

describe('urlPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<UrlConfig> = {}): UrlConfig => ({
    ...BASE,
    kind: FieldKind.URL,
    label: 'Website URL',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = urlPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label, description, placeholder, validation message inputs', () => {
    const { ConfigEditor } = urlPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(4);
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = urlPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'U');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'U' }));
  });
});

// ---------------------------------------------------------------------------
// PHONE ConfigEditor
// ---------------------------------------------------------------------------

describe('phonePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<PhoneConfig> = {}): PhoneConfig => ({
    ...BASE,
    kind: FieldKind.PHONE,
    label: 'Phone',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = phonePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows a label input', () => {
    const { ConfigEditor } = phonePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Mobile' }), onChange: vi.fn(), allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Mobile');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = phonePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'P');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'P' }));
  });

  it('shows a country code dropdown', () => {
    const { ConfigEditor } = phonePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange when country code is changed', async () => {
    const { ConfigEditor } = phonePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ defaultCountryCode: '+1' }), onChange, allFields: [] }));
    await user.selectOptions(screen.getByRole('combobox'), '+44');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ defaultCountryCode: '+44' }));
  });
});

// ---------------------------------------------------------------------------
// SINGLE_SELECT ConfigEditor
// ---------------------------------------------------------------------------

describe('singleSelectPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<SingleSelectConfig> = {}): SingleSelectConfig => ({
    ...BASE,
    kind: FieldKind.SINGLE_SELECT,
    label: 'Pick one',
    options: [
      { id: 'opt-a', label: 'Option A' },
      { id: 'opt-b', label: 'Option B' },
    ],
    variant: SingleSelectVariant.RADIO,
    allowOther: false,
    shuffleOptions: false,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = singleSelectPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows existing option labels', () => {
    const { ConfigEditor } = singleSelectPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    const optionValues = inputs.map((el) => (el as HTMLInputElement).value);
    expect(optionValues).toContain('Option A');
    expect(optionValues).toContain('Option B');
  });

  it('calls onChange with updated option label', () => {
    const { ConfigEditor } = singleSelectPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    // Find the input with 'Option A'
    const inputs = screen.getAllByRole('textbox');
    const optAInput = inputs.find((el) => (el as HTMLInputElement).value === 'Option A')!;
    fireEvent.change(optAInput, { target: { value: 'Choice X' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.arrayContaining([expect.objectContaining({ label: 'Choice X' })]),
      }),
    );
  });

  it('calls onChange when "+ Add option" is clicked', async () => {
    const { ConfigEditor } = singleSelectPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    await user.click(screen.getByRole('button', { name: /add option/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ options: expect.any(Array) }),
    );
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as SingleSelectConfig;
    expect(lastCall.options.length).toBe(3);
  });

  it('shows variant buttons', () => {
    const { ConfigEditor } = singleSelectPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByRole('button', { name: /radio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dropdown/i })).toBeInTheDocument();
  });

  it('calls onChange when variant button is clicked', async () => {
    const { ConfigEditor } = singleSelectPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    await user.click(screen.getByRole('button', { name: /dropdown/i }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ variant: SingleSelectVariant.DROPDOWN }),
    );
  });

  it('shows columns dropdown when variant is radio', () => {
    const { ConfigEditor } = singleSelectPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ variant: SingleSelectVariant.RADIO }), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MULTI_SELECT ConfigEditor
// ---------------------------------------------------------------------------

describe('multiSelectPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<MultiSelectConfig> = {}): MultiSelectConfig => ({
    ...BASE,
    kind: FieldKind.MULTI_SELECT,
    label: 'Pick many',
    options: [
      { id: 'opt-1', label: 'Choice 1' },
      { id: 'opt-2', label: 'Choice 2' },
    ],
    minSelections: null,
    maxSelections: null,
    searchable: false,
    allowOther: false,
    shuffleOptions: false,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = multiSelectPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows existing option labels', () => {
    const { ConfigEditor } = multiSelectPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    const values = inputs.map((el) => (el as HTMLInputElement).value);
    expect(values).toContain('Choice 1');
    expect(values).toContain('Choice 2');
  });

  it('calls onChange when "+ Add option" is clicked', async () => {
    const { ConfigEditor } = multiSelectPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    await user.click(screen.getByRole('button', { name: /add option/i }));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0] as MultiSelectConfig;
    expect(lastCall.options.length).toBe(3);
  });

  it('shows min/max selections spinbuttons', () => {
    const { ConfigEditor } = multiSelectPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getAllByRole('spinbutton').length).toBeGreaterThanOrEqual(2);
  });

  it('calls onChange with updated min selections', () => {
    const { ConfigEditor } = multiSelectPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    const [minInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(minInput, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minSelections: 2 }));
  });
});

// ---------------------------------------------------------------------------
// RATING ConfigEditor
// ---------------------------------------------------------------------------

describe('ratingPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<RatingConfig> = {}): RatingConfig => ({
    ...BASE,
    kind: FieldKind.RATING,
    label: 'Rating',
    maxRating: 5,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = ratingPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label, max rating select, low label, high label inputs', () => {
    const { ConfigEditor } = ratingPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // max rating select
    // label + low label + high label = 3 textboxes
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(3);
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = ratingPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'R');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'R' }));
  });

  it('calls onChange when max rating select changes to 10', async () => {
    const { ConfigEditor } = ratingPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ maxRating: 5 }), onChange, allFields: [] }));
    await user.selectOptions(screen.getByRole('combobox'), '10');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ maxRating: 10 }));
  });

  it('calls onChange with updated low label', () => {
    const { ConfigEditor } = ratingPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    // inputs[1] is low label, inputs[2] is high label
    fireEvent.change(inputs[1], { target: { value: 'Bad' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ lowLabel: 'Bad' }));
  });
});

// ---------------------------------------------------------------------------
// LINEAR_SCALE ConfigEditor
// ---------------------------------------------------------------------------

describe('linearScalePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<LinearScaleConfig> = {}): LinearScaleConfig => ({
    ...BASE,
    kind: FieldKind.LINEAR_SCALE,
    label: 'Satisfaction',
    minValue: 1,
    maxValue: 5,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = linearScalePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows min/max selects', () => {
    const { ConfigEditor } = linearScalePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onChange when max value select changes', async () => {
    const { ConfigEditor } = linearScalePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ maxValue: 5 }), onChange, allFields: [] }));
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], '10');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ maxValue: 10 }));
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = linearScalePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'L');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'L' }));
  });

  it('calls onChange with updated min label', () => {
    const { ConfigEditor } = linearScalePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    // inputs[1] = min label
    fireEvent.change(inputs[1], { target: { value: 'Disagree' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minLabel: 'Disagree' }));
  });
});

// ---------------------------------------------------------------------------
// FILE_UPLOAD ConfigEditor
// ---------------------------------------------------------------------------

describe('fileUploadPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<FileUploadConfig> = {}): FileUploadConfig => ({
    ...BASE,
    kind: FieldKind.FILE_UPLOAD,
    label: 'Attachment',
    allowedTypes: [],
    maxFiles: 1,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = fileUploadPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label input with current value', () => {
    const { ConfigEditor } = fileUploadPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Resume' }), onChange: vi.fn(), allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Resume');
  });

  it('shows max files spinbutton', () => {
    const { ConfigEditor } = fileUploadPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ maxFiles: 3 }), onChange: vi.fn(), allFields: [] }));
    const spinner = screen.getAllByRole('spinbutton')[0];
    expect((spinner as HTMLInputElement).value).toBe('3');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = fileUploadPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'F');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'F' }));
  });

  it('calls onChange with updated allowed types', () => {
    const { ConfigEditor } = fileUploadPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    // Last textbox is "Allowed types"
    const inputs = screen.getAllByRole('textbox');
    const allowedInput = inputs[inputs.length - 1];
    fireEvent.change(allowedInput, { target: { value: '.pdf,.png' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ allowedTypes: ['.pdf', '.png'] }),
    );
  });
});

// ---------------------------------------------------------------------------
// SIGNATURE ConfigEditor
// ---------------------------------------------------------------------------

describe('signaturePlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<SignatureConfig> = {}): SignatureConfig => ({
    ...BASE,
    kind: FieldKind.SIGNATURE,
    label: 'Signature',
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = signaturePlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label and description inputs', () => {
    const { ConfigEditor } = signaturePlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Sign here' }), onChange: vi.fn(), allFields: [] }));
    const inputs = screen.getAllByRole('textbox');
    expect((inputs[0] as HTMLInputElement).value).toBe('Sign here');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = signaturePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'S');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'S' }));
  });

  it('calls onChange with updated description', () => {
    const { ConfigEditor } = signaturePlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'By signing you agree' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ description: 'By signing you agree' }));
  });
});

// ---------------------------------------------------------------------------
// ADDRESS ConfigEditor
// ---------------------------------------------------------------------------

describe('addressPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<AddressConfig> = {}): AddressConfig => ({
    ...BASE,
    kind: FieldKind.ADDRESS,
    label: 'Address',
    includeStreet2: true,
    includeState: true,
    includeZip: true,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = addressPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label input', () => {
    const { ConfigEditor } = addressPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Home Address' }), onChange: vi.fn(), allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Home Address');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = addressPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'A');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'A' }));
  });

  it('renders toggle for address line 2', () => {
    const { ConfigEditor } = addressPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByText(/address line 2/i)).toBeInTheDocument();
  });

  it('calls onChange when "Include address line 2" toggle is clicked', async () => {
    const { ConfigEditor } = addressPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ includeStreet2: true }), onChange, allFields: [] }));
    // Toggle renders role="switch"; click the wrapper row that contains the "address line 2" label
    const switches = screen.getAllByRole('switch');
    // First switch is for includeStreet2
    await user.click(switches[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ includeStreet2: false }));
  });

  it('renders toggle for state / province', () => {
    const { ConfigEditor } = addressPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByText(/state \/ province/i)).toBeInTheDocument();
  });

  it('renders toggle for ZIP / postal code', () => {
    const { ConfigEditor } = addressPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByText(/zip \/ postal/i)).toBeInTheDocument();
  });

  it('calls onChange with updated countryFixed value', () => {
    const { ConfigEditor } = addressPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    // Last textbox is the fixed country input
    const inputs = screen.getAllByRole('textbox');
    const countryInput = inputs[inputs.length - 1];
    fireEvent.change(countryInput, { target: { value: 'United States' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ countryFixed: 'United States' }));
  });
});

// ---------------------------------------------------------------------------
// CALCULATION ConfigEditor
// ---------------------------------------------------------------------------

describe('calculationPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<CalculationConfig> = {}): CalculationConfig => ({
    ...BASE,
    kind: FieldKind.CALCULATION,
    label: 'Total',
    operation: CalculationOperation.SUM,
    sourceFieldIds: [],
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing with no allFields', () => {
    const { ConfigEditor } = calculationPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows "Add number fields first" when there are no numeric source fields', () => {
    const { ConfigEditor } = calculationPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByText(/add number fields first/i)).toBeInTheDocument();
  });

  it('shows numeric source fields as checkboxes when allFields contains a number field', () => {
    const { ConfigEditor } = calculationPlugin;
    const allFields = [
      { ...BASE, kind: FieldKind.NUMBER, label: 'Quantity' } as const,
    ];
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields }));
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls onChange when a source field checkbox is checked', async () => {
    const { ConfigEditor } = calculationPlugin;
    const onChange = vi.fn();
    const allFields = [
      { ...BASE, id: 'qty-field', kind: FieldKind.NUMBER, label: 'Qty' } as const,
    ];
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields }));
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sourceFieldIds: ['qty-field'] }),
    );
  });

  it('calls onChange when operation select changes', async () => {
    const { ConfigEditor } = calculationPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    await user.selectOptions(screen.getByRole('combobox'), CalculationOperation.AVG);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ operation: CalculationOperation.AVG }),
    );
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = calculationPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'C');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'C' }));
  });
});

// ---------------------------------------------------------------------------
// SECTION_HEADER ConfigEditor
// ---------------------------------------------------------------------------

describe('sectionHeaderPlugin.ConfigEditor', () => {
  const user = userEvent.setup();

  const makeConfig = (overrides: Partial<SectionHeaderConfig> = {}): SectionHeaderConfig => ({
    ...BASE,
    kind: FieldKind.SECTION_HEADER,
    label: 'Section',
    size: SectionHeaderSize.MD,
    showDivider: false,
    ...overrides,
  });

  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    expect(() => render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }))).not.toThrow();
  });

  it('shows label input with current value', () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: 'Contact Info' }), onChange: vi.fn(), allFields: [] }));
    const labelInput = screen.getAllByRole('textbox')[0];
    expect((labelInput as HTMLInputElement).value).toBe('Contact Info');
  });

  it('calls onChange with updated label', async () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ label: '' }), onChange, allFields: [] }));
    await user.type(screen.getAllByRole('textbox')[0], 'S');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ label: 'S' }));
  });

  it('shows a size select', () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onChange when size changes to xl', async () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange, allFields: [] }));
    await user.selectOptions(screen.getByRole('combobox'), SectionHeaderSize.XL);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ size: SectionHeaderSize.XL }));
  });

  it('shows Show divider toggle', () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    render(React.createElement(ConfigEditor, { config: makeConfig(), onChange: vi.fn(), allFields: [] }));
    expect(screen.getByText(/show divider/i)).toBeInTheDocument();
  });

  it('calls onChange with showDivider true when toggle is clicked', async () => {
    const { ConfigEditor } = sectionHeaderPlugin;
    const onChange = vi.fn();
    render(React.createElement(ConfigEditor, { config: makeConfig({ showDivider: false }), onChange, allFields: [] }));
    // Toggle renders role="switch", not role="button"
    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ showDivider: true }));
  });
});
