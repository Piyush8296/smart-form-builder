import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostSubmitScreen } from './PostSubmitScreen';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function getProps(overrides: Partial<{
  message: string;
  showSubmitAnother: boolean;
  onSubmitAnother: () => void;
}> = {}) {
  return {
    message: 'Your response has been submitted.',
    showSubmitAnother: false,
    onSubmitAnother: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PostSubmitScreen', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('displays the success message', () => {
      render(<PostSubmitScreen {...getProps()} />);
      expect(screen.getByText('Your response has been submitted.')).toBeInTheDocument();
    });

    it('renders a custom message prop', () => {
      render(<PostSubmitScreen {...getProps({ message: 'Thank you for filling this out!' })} />);
      expect(screen.getByText('Thank you for filling this out!')).toBeInTheDocument();
    });

    it('does not show the submit-another button when showSubmitAnother is false', () => {
      render(<PostSubmitScreen {...getProps({ showSubmitAnother: false })} />);
      expect(screen.queryByRole('button', { name: /submit another/i })).not.toBeInTheDocument();
    });

    it('shows the submit-another button when showSubmitAnother is true', () => {
      render(<PostSubmitScreen {...getProps({ showSubmitAnother: true })} />);
      expect(screen.getByRole('button', { name: /submit another/i })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onSubmitAnother when the button is clicked', async () => {
      const onSubmitAnother = vi.fn();
      render(<PostSubmitScreen {...getProps({ showSubmitAnother: true, onSubmitAnother })} />);
      await user.click(screen.getByRole('button', { name: /submit another/i }));
      expect(onSubmitAnother).toHaveBeenCalledOnce();
    });

    it('does not call onSubmitAnother when button is absent', () => {
      const onSubmitAnother = vi.fn();
      render(<PostSubmitScreen {...getProps({ showSubmitAnother: false, onSubmitAnother })} />);
      expect(onSubmitAnother).not.toHaveBeenCalled();
    });
  });
});
