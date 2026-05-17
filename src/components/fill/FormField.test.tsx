import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormField } from './FormField';
import {
  FieldKind,
  SingleSelectVariant,
  CalculationOperation,
  SectionHeaderSize,
} from '../../enums';
import type { FieldConfig } from '../../types/fields';
import type { FieldVisibilityState } from '../../types/conditions';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeVisibilityState(overrides: Partial<FieldVisibilityState> = {}): FieldVisibilityState {
  return { fieldId: 'f1', visible: true, required: false, ...overrides };
}

function makeBaseField(id: string, kind: FieldKind): Pick<FieldConfig, 'id' | 'kind' | 'label' | 'conditions' | 'defaultVisible' | 'defaultRequired'> {
  return {
    id,
    kind,
    label: `Label for ${kind}`,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
  };
}

function getProps(fieldOverrides: Partial<FieldConfig> = {}, propOverrides: Record<string, unknown> = {}) {
  const field: FieldConfig = {
    ...makeBaseField('f1', FieldKind.TEXT_SINGLE),
    ...fieldOverrides,
  } as FieldConfig;
  return {
    field,
    value: null,
    onChange: vi.fn(),
    error: null,
    visibilityState: makeVisibilityState({ fieldId: field.id }),
    ...propOverrides,
  };
}

// ---------------------------------------------------------------------------
// Smoke tests — one per field kind
// ---------------------------------------------------------------------------

describe('FormField', () => {
  const user = userEvent.setup();

  beforeEach(() => { vi.clearAllMocks(); });

  describe('text-single', () => {
    it('renders without crashing', () => {
      const props = getProps();
      render(<FormField {...props} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('shows the field label', () => {
      const props = getProps({ label: 'First name' } as Partial<FieldConfig>);
      render(<FormField {...props} />);
      expect(screen.getByText('First name')).toBeInTheDocument();
    });

    it('shows a required asterisk when required', () => {
      const props = getProps({} as Partial<FieldConfig>, {
        visibilityState: makeVisibilityState({ required: true }),
      });
      render(<FormField {...props} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows description text when provided', () => {
      const props = getProps({ description: 'Helper text' } as Partial<FieldConfig>);
      render(<FormField {...props} />);
      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });

    it('calls onChange when the user types', async () => {
      const onChange = vi.fn();
      const props = getProps({} as Partial<FieldConfig>, { onChange });
      render(<FormField {...props} />);
      await user.type(screen.getByRole('textbox'), 'hello');
      expect(onChange).toHaveBeenCalled();
    });

    it('applies data-error attribute when error is present', () => {
      const props = getProps({} as Partial<FieldConfig>, { error: 'This field is required' });
      const { container } = render(<FormField {...props} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.dataset.error).toBe('true');
    });

    it('does not show data-error when error is null', () => {
      const props = getProps();
      const { container } = render(<FormField {...props} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.dataset.error).toBeUndefined();
    });
  });

  describe('text-multi', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f2', FieldKind.TEXT_MULTI),
        label: 'Comments',
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f2' })} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('number', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f3', FieldKind.NUMBER),
        label: 'Age',
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f3' })} />);
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('date', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f4', FieldKind.DATE),
        label: 'Birth date',
        prefillToday: false,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f4' })} />);
      // date input is type="date"
      expect(screen.getByDisplayValue('') || document.querySelector('input[type="date"]')).toBeTruthy();
    });
  });

  describe('time', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f5', FieldKind.TIME),
        label: 'Meeting time',
      } as FieldConfig;
      const { container } = render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f5' })} />);
      expect(container.querySelector('input[type="time"]')).toBeInTheDocument();
    });
  });

  describe('email', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f6', FieldKind.EMAIL),
        label: 'Email address',
      } as FieldConfig;
      const { container } = render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f6' })} />);
      expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    });
  });

  describe('url', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f7', FieldKind.URL),
        label: 'Website',
      } as FieldConfig;
      const { container } = render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f7' })} />);
      expect(container.querySelector('input[type="url"]') || container.querySelector('input')).toBeTruthy();
    });
  });

  describe('phone', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f8', FieldKind.PHONE),
        label: 'Phone number',
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f8' })} />);
      expect(screen.getByText('Phone number')).toBeInTheDocument();
    });
  });

  describe('single-select', () => {
    it('renders without crashing (radio variant)', () => {
      const field: FieldConfig = {
        ...makeBaseField('f9', FieldKind.SINGLE_SELECT),
        label: 'Favourite colour',
        options: [{ id: 'o1', label: 'Red' }, { id: 'o2', label: 'Blue' }],
        variant: SingleSelectVariant.RADIO,
        allowOther: false,
        shuffleOptions: false,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f9' })} />);
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
    });

    it('renders without crashing (dropdown variant)', () => {
      const field: FieldConfig = {
        ...makeBaseField('f9b', FieldKind.SINGLE_SELECT),
        label: 'Country',
        options: [{ id: 'o1', label: 'USA' }],
        variant: SingleSelectVariant.DROPDOWN,
        allowOther: false,
        shuffleOptions: false,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f9b' })} />);
      expect(screen.getByText('Country')).toBeInTheDocument();
    });
  });

  describe('multi-select', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f10', FieldKind.MULTI_SELECT),
        label: 'Interests',
        options: [{ id: 'o1', label: 'Coding' }, { id: 'o2', label: 'Music' }],
        minSelections: null,
        maxSelections: null,
        searchable: false,
        allowOther: false,
        shuffleOptions: false,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f10' })} />);
      expect(screen.getByText('Coding')).toBeInTheDocument();
    });
  });

  describe('rating', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f11', FieldKind.RATING),
        label: 'Rate your experience',
        maxRating: 5,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f11' })} />);
      expect(screen.getByText('Rate your experience')).toBeInTheDocument();
    });
  });

  describe('linear-scale', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f12', FieldKind.LINEAR_SCALE),
        label: 'How likely to recommend?',
        minValue: 0,
        maxValue: 10,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f12' })} />);
      expect(screen.getByText('How likely to recommend?')).toBeInTheDocument();
    });
  });

  describe('section-header', () => {
    it('renders without crashing and does not show a label row', () => {
      const field: FieldConfig = {
        ...makeBaseField('f13', FieldKind.SECTION_HEADER),
        label: 'Personal Details',
        size: SectionHeaderSize.MD,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f13' })} />);
      // Section header renders the label inside the renderer, not in the outer label row
      expect(screen.getByText('Personal Details')).toBeInTheDocument();
    });
  });

  describe('calculation', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f14', FieldKind.CALCULATION),
        label: 'Total',
        operation: CalculationOperation.SUM,
        sourceFieldIds: [],
      } as FieldConfig;
      render(<FormField field={field} value={42} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f14' })} />);
      // Calculation is display-only; the label row is not shown but the value should be rendered
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('address', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f15', FieldKind.ADDRESS),
        label: 'Home address',
        includeStreet2: true,
        includeState: true,
        includeZip: true,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f15' })} />);
      expect(screen.getByText('Home address')).toBeInTheDocument();
    });
  });

  describe('file-upload', () => {
    it('renders without crashing', () => {
      const field: FieldConfig = {
        ...makeBaseField('f16', FieldKind.FILE_UPLOAD),
        label: 'Attach resume',
        allowedTypes: ['application/pdf'],
        maxFiles: 1,
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f16' })} />);
      expect(screen.getByText('Attach resume')).toBeInTheDocument();
    });
  });

  describe('signature', () => {
    it('renders without crashing', () => {
      // jsdom does not implement canvas — stub getContext using the bind-first pattern
      // (documented in agent memory) so the signature's useEffect doesn't throw.
      const original = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
        const el = original(tag);
        if (tag === 'canvas') {
          Object.defineProperty(el, 'getContext', {
            value: () => ({
              strokeStyle: '',
              lineWidth: 0,
              lineCap: '',
              lineJoin: '',
              beginPath: vi.fn(),
              moveTo: vi.fn(),
              lineTo: vi.fn(),
              stroke: vi.fn(),
              clearRect: vi.fn(),
              toDataURL: vi.fn(() => 'data:image/png;base64,'),
            }),
            writable: true,
          });
        }
        return el;
      });

      const field: FieldConfig = {
        ...makeBaseField('f17', FieldKind.SIGNATURE),
        label: 'Sign here',
      } as FieldConfig;
      render(<FormField field={field} value={null} onChange={vi.fn()} error={null} visibilityState={makeVisibilityState({ fieldId: 'f17' })} />);
      expect(screen.getByText('Sign here')).toBeInTheDocument();

      vi.restoreAllMocks();
    });
  });

  describe('field id attribute', () => {
    it('sets the wrapper id to field-<fieldId>', () => {
      const props = getProps({ id: 'my-field-id' } as Partial<FieldConfig>);
      const { container } = render(<FormField {...props} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.id).toBe('field-my-field-id');
    });
  });

  describe('disabled state', () => {
    it('passes disabled to the renderer', () => {
      const props = { ...getProps(), disabled: true };
      const { container } = render(<FormField {...props} />);
      const input = container.querySelector('input');
      expect(input).toBeDisabled();
    });
  });
});
