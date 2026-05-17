import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FillToolbar } from './FillToolbar';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function getProps(overrides: Partial<{
  answeredCount: number;
  totalVisible: number;
  onSubmit: () => void;
  onSaveExit: (() => void) | undefined;
  submitError: string | null;
  hasDraft: boolean;
}> = {}) {
  return {
    answeredCount: 3,
    totalVisible: 5,
    onSubmit: vi.fn(),
    onSaveExit: undefined,
    submitError: null,
    hasDraft: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FillToolbar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Progress display
  // -------------------------------------------------------------------------
  describe('progress display', () => {
    it('shows answered count and total visible fields', () => {
      render(<FillToolbar {...getProps({ answeredCount: 2, totalVisible: 7 })} />);
      expect(screen.getByText(/2 of 7 answered/i)).toBeInTheDocument();
    });

    it('shows zero answered out of zero visible', () => {
      render(<FillToolbar {...getProps({ answeredCount: 0, totalVisible: 0 })} />);
      expect(screen.getByText(/0 of 0 answered/i)).toBeInTheDocument();
    });

    it('prefixes the progress with "Draft auto-saved" when hasDraft is true', () => {
      render(<FillToolbar {...getProps({ hasDraft: true, answeredCount: 1, totalVisible: 4 })} />);
      expect(screen.getByText(/draft auto-saved/i)).toBeInTheDocument();
    });

    it('does not show draft indicator when hasDraft is false', () => {
      render(<FillToolbar {...getProps({ hasDraft: false })} />);
      expect(screen.queryByText(/draft auto-saved/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Submit button
  // -------------------------------------------------------------------------
  describe('submit button', () => {
    it('renders a submit button', () => {
      render(<FillToolbar {...getProps()} />);
      expect(screen.getByRole('button', { name: /submit response/i })).toBeInTheDocument();
    });

    it('calls onSubmit when submit button is clicked', async () => {
      const onSubmit = vi.fn();
      render(<FillToolbar {...getProps({ onSubmit })} />);
      await user.click(screen.getByRole('button', { name: /submit response/i }));
      expect(onSubmit).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // Save & exit button
  // -------------------------------------------------------------------------
  describe('save and exit button', () => {
    it('does not render the save-and-exit button when onSaveExit is undefined', () => {
      render(<FillToolbar {...getProps({ onSaveExit: undefined })} />);
      expect(screen.queryByRole('button', { name: /save.*exit/i })).not.toBeInTheDocument();
    });

    it('renders the save-and-exit button when onSaveExit is provided', () => {
      render(<FillToolbar {...getProps({ onSaveExit: vi.fn() })} />);
      expect(screen.getByRole('button', { name: /save.*exit/i })).toBeInTheDocument();
    });

    it('calls onSaveExit when save-and-exit button is clicked', async () => {
      const onSaveExit = vi.fn();
      render(<FillToolbar {...getProps({ onSaveExit })} />);
      await user.click(screen.getByRole('button', { name: /save.*exit/i }));
      expect(onSaveExit).toHaveBeenCalledOnce();
    });
  });

  // -------------------------------------------------------------------------
  // Error state
  // -------------------------------------------------------------------------
  describe('error display', () => {
    it('does not show an error banner when submitError is null', () => {
      render(<FillToolbar {...getProps({ submitError: null })} />);
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('shows the submitError message when present', () => {
      render(<FillToolbar {...getProps({ submitError: 'Please fill all required fields.' })} />);
      expect(screen.getByText(/please fill all required fields/i)).toBeInTheDocument();
    });

    it('shows a different error message when a different error is provided', () => {
      render(<FillToolbar {...getProps({ submitError: 'Network error. Try again.' })} />);
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
