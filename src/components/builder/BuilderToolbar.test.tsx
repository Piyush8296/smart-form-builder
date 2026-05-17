import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { BuilderToolbar } from './BuilderToolbar';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function getProps(overrides: Partial<{
  title: string;
  hasUnsavedChanges: boolean;
  onTitleChange: (title: string) => void;
  onSettings: () => void;
  onPreview: () => void;
  templateId: string;
}> = {}) {
  return {
    title: 'My Form',
    hasUnsavedChanges: false,
    onTitleChange: vi.fn(),
    onSettings: vi.fn(),
    onPreview: vi.fn(),
    templateId: 'tmpl-abc',
    ...overrides,
  };
}

// BuilderToolbar renders Brand which calls useNavigate — wrap in MemoryRouter.
function renderToolbar(props?: Parameters<typeof getProps>[0]) {
  return render(
    React.createElement(MemoryRouter, null,
      React.createElement(BuilderToolbar, getProps(props)),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BuilderToolbar', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  describe('rendering', () => {
    it('displays the form title in the input', () => {
      renderToolbar({ title: 'Feedback Survey' });
      expect(screen.getByDisplayValue('Feedback Survey')).toBeInTheDocument();
    });

    it('shows "Saved" when hasUnsavedChanges is false', () => {
      renderToolbar({ hasUnsavedChanges: false });
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('shows "Unsaved changes" when hasUnsavedChanges is true', () => {
      renderToolbar({ hasUnsavedChanges: true });
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('renders a Preview button', () => {
      renderToolbar();
      expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument();
    });

    it('renders the "Open form" link pointing to /fill/<templateId>', () => {
      renderToolbar({ templateId: 'tmpl-xyz' });
      const link = screen.getByRole('link', { name: /open form/i });
      expect(link).toHaveAttribute('href', '/fill/tmpl-xyz');
    });

    it('renders the "Open form" link with target _blank', () => {
      renderToolbar({ templateId: 'tmpl-xyz' });
      const link = screen.getByRole('link', { name: /open form/i });
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders the title input with placeholder "Untitled form"', () => {
      renderToolbar({ title: '' });
      const input = screen.getByPlaceholderText('Untitled form');
      expect(input).toBeInTheDocument();
    });

    it('renders a Settings icon button', () => {
      renderToolbar();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Title editing
  // -------------------------------------------------------------------------
  describe('title editing', () => {
    it('calls onTitleChange when the title input changes', async () => {
      const onTitleChange = vi.fn();
      renderToolbar({ title: '', onTitleChange });
      const input = screen.getByPlaceholderText('Untitled form');
      await user.type(input, 'A');
      expect(onTitleChange).toHaveBeenCalledWith('A');
    });

    it('passes the full value of the input on each keystroke', async () => {
      const onTitleChange = vi.fn();
      renderToolbar({ title: 'He', onTitleChange });
      const input = screen.getByDisplayValue('He');
      await user.type(input, 'y');
      // The last call should include the typed character appended to the controlled value
      expect(onTitleChange).toHaveBeenLastCalledWith('Hey');
    });
  });

  // -------------------------------------------------------------------------
  // Button callbacks
  // -------------------------------------------------------------------------
  describe('button interactions', () => {
    it('calls onSettings when the Settings button is clicked', async () => {
      const onSettings = vi.fn();
      renderToolbar({ onSettings });
      await user.click(screen.getByRole('button', { name: /settings/i }));
      expect(onSettings).toHaveBeenCalledOnce();
    });

    it('calls onPreview when the Preview button is clicked', async () => {
      const onPreview = vi.fn();
      renderToolbar({ onPreview });
      await user.click(screen.getByRole('button', { name: /preview/i }));
      expect(onPreview).toHaveBeenCalledOnce();
    });
  });
});
