import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FieldListItem } from './FieldListItem';
import { FieldKind } from '../../enums';
import type { FieldConfig } from '../../types/fields';

// ---------------------------------------------------------------------------
// Mock @dnd-kit/sortable — jsdom has no pointer-events support needed by dnd-kit
// ---------------------------------------------------------------------------

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeTextField(overrides: Partial<FieldConfig> = {}): FieldConfig {
  return {
    id: 'field-1',
    kind: FieldKind.TEXT_SINGLE,
    label: 'Full name',
    description: '',
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  } as FieldConfig;
}

function getProps(overrides: Partial<{
  field: FieldConfig;
  selected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleRequired: () => void;
}> = {}) {
  const field = overrides.field ?? makeTextField();
  return {
    field,
    selected: false,
    onSelect: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onToggleRequired: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FieldListItem', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('displays the field label', () => {
      render(<FieldListItem {...getProps()} />);
      expect(screen.getByText('Full name')).toBeInTheDocument();
    });

    it('shows "(no label)" when the field label is empty', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ label: '' }) })} />);
      expect(screen.getByText('(no label)')).toBeInTheDocument();
    });

    it('shows the plugin display name in the footer', () => {
      render(<FieldListItem {...getProps()} />);
      // text-single plugin is labelled "Short text"
      expect(screen.getByText(/short text/i)).toBeInTheDocument();
    });

    it('shows a required asterisk when defaultRequired is true', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ defaultRequired: true }) })} />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not show a required asterisk when defaultRequired is false', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ defaultRequired: false }) })} />);
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('renders the drag handle with accessible label', () => {
      render(<FieldListItem {...getProps()} />);
      expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
    });

    it('renders a Duplicate button', () => {
      render(<FieldListItem {...getProps()} />);
      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
    });

    it('renders a Delete button', () => {
      render(<FieldListItem {...getProps()} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('renders a Required toggle button', () => {
      render(<FieldListItem {...getProps()} />);
      // The Required button is a <button> element (the outer card uses role="button" on a div).
      // Filter to only native <button> elements to avoid the ambient card match.
      const requiredBtns = screen.getAllByRole('button', { name: /required/i })
        .filter((el) => el.tagName === 'BUTTON');
      expect(requiredBtns.length).toBeGreaterThan(0);
    });

    it('shows field description when present', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ description: 'Enter your legal name' }) })} />);
      expect(screen.getByText('Enter your legal name')).toBeInTheDocument();
    });

    it('does not show description area when description is empty', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ description: '' }) })} />);
      expect(screen.queryByText('Enter your legal name')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Selected state
  // -------------------------------------------------------------------------
  describe('selected state', () => {
    it('sets data-selected=true on the root when selected is true', () => {
      render(<FieldListItem {...getProps({ selected: true })} />);
      const card = screen.getAllByRole('button').find((el) => el.hasAttribute('data-selected'));
      expect(card).toHaveAttribute('data-selected', 'true');
    });

    it('sets data-selected=false on the root when selected is false', () => {
      render(<FieldListItem {...getProps({ selected: false })} />);
      // The outer card is a div with role="button". getAllByRole returns all buttons;
      // the card div is the only one that carries data-selected.
      const card = screen.getAllByRole('button').find((el) => el.hasAttribute('data-selected'));
      expect(card).toHaveAttribute('data-selected', 'false');
    });
  });

  // -------------------------------------------------------------------------
  // Visibility chip
  // -------------------------------------------------------------------------
  describe('visibility chip', () => {
    it('shows "Hidden" chip when defaultVisible is false', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ defaultVisible: false }) })} />);
      expect(screen.getByText(/hidden/i)).toBeInTheDocument();
    });

    it('does not show "Hidden" chip when defaultVisible is true', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ defaultVisible: true }) })} />);
      expect(screen.queryByText(/hidden/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Conditional chip
  // -------------------------------------------------------------------------
  describe('conditional chip', () => {
    it('shows "Conditional" chip when field has conditions', () => {
      const field = makeTextField({
        conditions: [{
          id: 'cond-1',
          targetFieldId: 'other',
          operator: 'equals' as never,
          value: 'x',
          effect: 'show' as never,
        }],
      });
      render(<FieldListItem {...getProps({ field })} />);
      expect(screen.getByText(/conditional/i)).toBeInTheDocument();
    });

    it('does not show "Conditional" chip when field has no conditions', () => {
      render(<FieldListItem {...getProps({ field: makeTextField({ conditions: [] }) })} />);
      expect(screen.queryByText(/conditional/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Interactions
  // -------------------------------------------------------------------------
  describe('interactions', () => {
    it('calls onSelect when the card is clicked', async () => {
      const onSelect = vi.fn();
      render(<FieldListItem {...getProps({ onSelect })} />);
      // Click the outer card div (role="button" on a div, carries data-selected).
      const card = screen.getAllByRole('button').find((el) => el.hasAttribute('data-selected'))!;
      await user.click(card);
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it('calls onSelect when Enter is pressed on the card', async () => {
      const onSelect = vi.fn();
      render(<FieldListItem {...getProps({ onSelect })} />);
      const card = screen.getAllByRole('button').find((el) => el.hasAttribute('data-selected'))!;
      card.focus();
      await user.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledOnce();
    });

    it('calls onDuplicate when Duplicate button is clicked', async () => {
      const onDuplicate = vi.fn();
      render(<FieldListItem {...getProps({ onDuplicate })} />);
      await user.click(screen.getByRole('button', { name: /duplicate/i }));
      expect(onDuplicate).toHaveBeenCalledOnce();
    });

    it('does not call onSelect when Duplicate button is clicked (stopPropagation)', async () => {
      const onSelect = vi.fn();
      const onDuplicate = vi.fn();
      render(<FieldListItem {...getProps({ onSelect, onDuplicate })} />);
      await user.click(screen.getByRole('button', { name: /duplicate/i }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('calls onDelete when Delete button is clicked', async () => {
      const onDelete = vi.fn();
      render(<FieldListItem {...getProps({ onDelete })} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onDelete).toHaveBeenCalledOnce();
    });

    it('does not call onSelect when Delete button is clicked (stopPropagation)', async () => {
      const onSelect = vi.fn();
      const onDelete = vi.fn();
      render(<FieldListItem {...getProps({ onSelect, onDelete })} />);
      await user.click(screen.getByRole('button', { name: /delete/i }));
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('calls onToggleRequired when Required toggle button is clicked', async () => {
      const onToggleRequired = vi.fn();
      render(<FieldListItem {...getProps({ onToggleRequired })} />);
      // Locate the native <button> whose text is "Required" (not the outer card div).
      const requiredBtn = screen.getAllByRole('button', { name: /required/i })
        .find((el) => el.tagName === 'BUTTON')!;
      await user.click(requiredBtn);
      expect(onToggleRequired).toHaveBeenCalledOnce();
    });

    it('does not call onSelect when Required toggle is clicked (stopPropagation)', async () => {
      const onSelect = vi.fn();
      const onToggleRequired = vi.fn();
      render(<FieldListItem {...getProps({ onSelect, onToggleRequired })} />);
      const requiredBtn = screen.getAllByRole('button', { name: /required/i })
        .find((el) => el.tagName === 'BUTTON')!;
      await user.click(requiredBtn);
      expect(onSelect).not.toHaveBeenCalled();
    });
  });
});
