import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddFieldMenu } from './AddFieldMenu';
import { FieldKind } from '../../enums';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function getProps(overrides: Partial<{ onAdd: (kind: FieldKind) => void }> = {}) {
  return {
    onAdd: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AddFieldMenu', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------
  describe('header', () => {
    it('renders the "Add field" heading', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText('Add field')).toBeInTheDocument();
    });

    it('renders the helper text about clicking to append', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText(/click a field type to append/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Group headers
  // -------------------------------------------------------------------------
  describe('group headers', () => {
    it('renders the "Input" group header', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText('Input')).toBeInTheDocument();
    });

    it('renders the "Select" group header', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText('Select')).toBeInTheDocument();
    });

    it('renders the "Display" group header', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText('Display')).toBeInTheDocument();
    });

    it('renders the "Special" group header', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByText('Special')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Field buttons — all plugins present
  // -------------------------------------------------------------------------
  describe('field type buttons', () => {
    it('renders a "Short text" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /short text/i })).toBeInTheDocument();
    });

    it('renders a "Paragraph" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /paragraph/i })).toBeInTheDocument();
    });

    it('renders a "Number" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add number field/i })).toBeInTheDocument();
    });

    it('renders a "Date" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add date field/i })).toBeInTheDocument();
    });

    it('renders a "Time" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add time field/i })).toBeInTheDocument();
    });

    it('renders an "Email" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add email field/i })).toBeInTheDocument();
    });

    it('renders a "Website URL" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /website url/i })).toBeInTheDocument();
    });

    it('renders an "Address" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add address field/i })).toBeInTheDocument();
    });

    it('renders a "Phone" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add phone field/i })).toBeInTheDocument();
    });

    it('renders a "Rating" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /add rating field/i })).toBeInTheDocument();
    });

    it('renders a "Linear scale" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /linear scale/i })).toBeInTheDocument();
    });

    it('renders a "File upload" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /file upload/i })).toBeInTheDocument();
    });

    it('renders a "Single select" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /single select/i })).toBeInTheDocument();
    });

    it('renders a "Multi select" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /multi select/i })).toBeInTheDocument();
    });

    it('renders a "Section header" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /section header/i })).toBeInTheDocument();
    });

    it('renders a "Calculation" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /calculation/i })).toBeInTheDocument();
    });

    it('renders a "Signature" button', () => {
      render(<AddFieldMenu {...getProps()} />);
      expect(screen.getByRole('button', { name: /signature/i })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Interactions — onAdd called with correct kind
  // -------------------------------------------------------------------------
  describe('interactions', () => {
    it('calls onAdd with TEXT_SINGLE when "Short text" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /short text/i }));
      expect(onAdd).toHaveBeenCalledOnce();
      expect(onAdd).toHaveBeenCalledWith(FieldKind.TEXT_SINGLE);
    });

    it('calls onAdd with TEXT_MULTI when "Paragraph" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /paragraph/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.TEXT_MULTI);
    });

    it('calls onAdd with NUMBER when "Number" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add number field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.NUMBER);
    });

    it('calls onAdd with DATE when "Date" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add date field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.DATE);
    });

    it('calls onAdd with TIME when "Time" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add time field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.TIME);
    });

    it('calls onAdd with EMAIL when "Email" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add email field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.EMAIL);
    });

    it('calls onAdd with URL when "Website URL" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /website url/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.URL);
    });

    it('calls onAdd with ADDRESS when "Address" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add address field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.ADDRESS);
    });

    it('calls onAdd with PHONE when "Phone" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add phone field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.PHONE);
    });

    it('calls onAdd with RATING when "Rating" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /add rating field/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.RATING);
    });

    it('calls onAdd with LINEAR_SCALE when "Linear scale" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /linear scale/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.LINEAR_SCALE);
    });

    it('calls onAdd with FILE_UPLOAD when "File upload" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /file upload/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.FILE_UPLOAD);
    });

    it('calls onAdd with SINGLE_SELECT when "Single select" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /single select/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.SINGLE_SELECT);
    });

    it('calls onAdd with MULTI_SELECT when "Multi select" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /multi select/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.MULTI_SELECT);
    });

    it('calls onAdd with SECTION_HEADER when "Section header" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /section header/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.SECTION_HEADER);
    });

    it('calls onAdd with CALCULATION when "Calculation" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /calculation/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.CALCULATION);
    });

    it('calls onAdd with SIGNATURE when "Signature" is clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /signature/i }));
      expect(onAdd).toHaveBeenCalledWith(FieldKind.SIGNATURE);
    });

    it('calls onAdd exactly once per click', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /short text/i }));
      expect(onAdd).toHaveBeenCalledOnce();
    });

    it('calls onAdd multiple times when different buttons are clicked', async () => {
      const onAdd = vi.fn();
      render(<AddFieldMenu {...getProps({ onAdd })} />);
      await user.click(screen.getByRole('button', { name: /short text/i }));
      await user.click(screen.getByRole('button', { name: /add number field/i }));
      expect(onAdd).toHaveBeenCalledTimes(2);
      expect(onAdd).toHaveBeenNthCalledWith(1, FieldKind.TEXT_SINGLE);
      expect(onAdd).toHaveBeenNthCalledWith(2, FieldKind.NUMBER);
    });
  });

  // -------------------------------------------------------------------------
  // Total button count sanity check
  // -------------------------------------------------------------------------
  describe('completeness', () => {
    it('renders 17 field-type buttons (one per registered plugin)', () => {
      render(<AddFieldMenu {...getProps()} />);
      // All field buttons are role="button" — count them
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(17);
    });
  });
});
