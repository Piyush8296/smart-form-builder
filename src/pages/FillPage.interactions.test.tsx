/**
 * Deeper interaction tests for FillPage:
 *  - Draft loading from storage pre-fills answers
 *  - Required field validation prevents submit
 *  - Successful submit shows PostSubmitScreen
 *  - Submit another resets the form
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import FillPage from './FillPage';
import { SESSION_KEY, templateKey } from '../storage/keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { FieldConfig, FieldValue } from '../types/fields';
import { FieldKind } from '../enums';

// ---------------------------------------------------------------------------
// Module mock — prevents useStorage.loadTemplate setError-during-render loop
// ---------------------------------------------------------------------------

const mockLoadTemplate = vi.fn();
const mockLoadDraft = vi.fn<() => Map<string, FieldValue> | null>(() => null);

vi.mock('../hooks/useStorage', () => ({
  useStorage: () => ({
    error: null,
    loadTemplate: mockLoadTemplate,
    loadInstance: vi.fn(() => null),
    loadInstances: vi.fn(() => []),
    removeInstance: vi.fn(),
    loadDraft: mockLoadDraft,
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEMPLATE_ID = 'tmpl-fill-deep';

function seedSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    userId: 'user-fill-deep',
    email: 'filldeep@example.com',
    displayName: 'Fill Deep',
    createdAt: new Date().toISOString(),
  }));
}

function makeField(id: string, label: string, kind: FieldKind = FieldKind.TEXT_SINGLE, overrides: Partial<FieldConfig> = {}): FieldConfig {
  return {
    id,
    kind,
    label,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  } as FieldConfig;
}

function makeRequiredField(id: string, label: string): FieldConfig {
  return makeField(id, label, FieldKind.TEXT_SINGLE, { defaultRequired: true });
}

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: TEMPLATE_ID,
    title: 'Deep Fill Test',
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function seedTemplate(t: Template) {
  localStorage.setItem(templateKey(t.id), JSON.stringify(t));
  mockLoadTemplate.mockReturnValue(t);
}

function renderFillPage(templateId = TEMPLATE_ID) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [`/fill/${templateId}`] },
      React.createElement(
        SessionProvider,
        null,
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: '/fill/:templateId', element: React.createElement(FillPage) }),
          React.createElement(Route, { path: '/', element: React.createElement('div', null, 'Home page') }),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FillPage — interactions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    vi.clearAllMocks();
    mockLoadTemplate.mockReturnValue(null);
    mockLoadDraft.mockReturnValue(null);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Required field validation
  // -------------------------------------------------------------------------

  describe('required field validation', () => {
    it('prevents submission and shows an error when a required text field is empty', async () => {
      seedTemplate(makeTemplate({
        fields: [makeRequiredField('f1', 'Your name')],
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit response/i }));

      // FieldRenderer does not render error text — the field wrapper gets data-error="true"
      expect(document.querySelector('[data-error="true"]')).toBeInTheDocument();
      // Post-submit screen must NOT appear
      expect(screen.queryByText(/response has been submitted/i)).not.toBeInTheDocument();
    });

    it('shows errors for multiple required fields simultaneously', async () => {
      seedTemplate(makeTemplate({
        fields: [
          makeRequiredField('f1', 'First field'),
          makeRequiredField('f2', 'Second field'),
        ],
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit response/i }));

      // Both field wrappers get data-error="true"
      const errorFields = document.querySelectorAll('[data-error="true"]');
      expect(errorFields.length).toBeGreaterThanOrEqual(2);
    });

    it('clears error after the required field is filled and re-submitted', async () => {
      seedTemplate(makeTemplate({
        fields: [makeRequiredField('f1', 'Full name')],
      }));
      renderFillPage();

      // First submit — field wrapper should get data-error="true"
      await user.click(screen.getByRole('button', { name: /submit response/i }));
      expect(document.querySelector('[data-error="true"]')).toBeInTheDocument();

      // Fill the field and re-submit
      const inputs = screen.getAllByRole('textbox');
      fireEvent.change(inputs[0], { target: { value: 'Jane Doe' } });
      await user.click(screen.getByRole('button', { name: /submit response/i }));

      await waitFor(() => {
        expect(screen.getByText(/response has been submitted/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Successful submit → PostSubmitScreen
  // -------------------------------------------------------------------------

  describe('submit flow', () => {
    it('shows PostSubmitScreen with confirmation message after successful submit', async () => {
      seedTemplate(makeTemplate({
        settings: {
          ...DEFAULT_TEMPLATE_SETTINGS,
          confirmationMessage: 'Thank you for your response!',
        },
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/thank you for your response/i)).toBeInTheDocument();
      });
    });

    it('hides the submit button after successful submission', async () => {
      seedTemplate(makeTemplate());
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit response/i }));

      await waitFor(() => {
        // "Submit response" button (FillToolbar) must be gone; PostSubmitScreen is shown instead
        expect(screen.queryByRole('button', { name: /submit response/i })).not.toBeInTheDocument();
        expect(screen.getByText(/response has been submitted/i)).toBeInTheDocument();
      });
    });

    it('shows "Submit another response" link when showSubmitAnotherLink is enabled', async () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showSubmitAnotherLink: true },
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/submit another/i)).toBeInTheDocument();
      });
    });

    it('does not show "Submit another" when showSubmitAnotherLink is false', async () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showSubmitAnotherLink: false },
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        // The post-submit screen appears
        expect(screen.getByText(/response has been submitted/i)).toBeInTheDocument();
      });
      expect(screen.queryByText(/submit another/i)).not.toBeInTheDocument();
    });

    it('clicking "Submit another" resets the form and shows the form again', async () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showSubmitAnotherLink: true },
        fields: [makeField('f1', 'Comments')],
      }));
      renderFillPage();

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText(/submit another/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/submit another/i));

      await waitFor(() => {
        // Submit button should reappear
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Draft loading pre-fills answers
  // -------------------------------------------------------------------------

  describe('draft loading', () => {
    it('pre-fills a text field when a draft exists for that field', async () => {
      const templateWithField = makeTemplate({
        fields: [makeField('f1', 'Your name')],
      });
      seedTemplate(templateWithField);

      // Simulate a stored draft: Map<fieldId, value>
      mockLoadDraft.mockReturnValue(new Map([['f1', 'Jane from draft']]));

      renderFillPage();

      // The text input should be pre-filled with the draft value
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect((inputs[0] as HTMLInputElement).value).toBe('Jane from draft');
      });
    });

    it('does not pre-fill when the draft is empty (null)', () => {
      const templateWithField = makeTemplate({
        fields: [makeField('f1', 'Your name')],
      });
      seedTemplate(templateWithField);
      mockLoadDraft.mockReturnValue(null);

      renderFillPage();

      const inputs = screen.getAllByRole('textbox');
      expect((inputs[0] as HTMLInputElement).value).toBe('');
    });

    it('does not pre-fill when the draft Map has size 0', () => {
      const templateWithField = makeTemplate({
        fields: [makeField('f1', 'Your name')],
      });
      seedTemplate(templateWithField);
      mockLoadDraft.mockReturnValue(new Map());

      renderFillPage();

      const inputs = screen.getAllByRole('textbox');
      expect((inputs[0] as HTMLInputElement).value).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Progress bar
  // -------------------------------------------------------------------------

  describe('progress bar', () => {
    it('shows progress bar when showProgressBar is true and fields exist', () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showProgressBar: true },
        fields: [makeField('f1', 'Q1')],
      }));
      renderFillPage();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show progress bar when showProgressBar is false', () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showProgressBar: false },
        fields: [makeField('f1', 'Q1')],
      }));
      renderFillPage();

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Form not found
  // -------------------------------------------------------------------------

  describe('form not found', () => {
    it('shows "Form not found" when the template is missing', () => {
      // mockLoadTemplate returns null by default in beforeEach
      renderFillPage('nonexistent-template-id');
      expect(screen.getByText(/form not found/i)).toBeInTheDocument();
    });

    it('shows a "Go home" button when form is missing', () => {
      renderFillPage('nonexistent-template-id');
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Field rendering
  // -------------------------------------------------------------------------

  describe('field rendering', () => {
    it('renders a field label for each field in the template', () => {
      seedTemplate(makeTemplate({
        fields: [
          makeField('f1', 'Full Name'),
          makeField('f2', 'Bio', FieldKind.TEXT_MULTI),
        ],
      }));
      renderFillPage();

      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Bio')).toBeInTheDocument();
    });

    it('renders the form title', () => {
      seedTemplate(makeTemplate({ title: 'My Survey' }));
      renderFillPage();

      expect(screen.getByRole('heading', { name: 'My Survey' })).toBeInTheDocument();
    });

    it('renders the form description when provided', () => {
      seedTemplate(makeTemplate({ description: 'Please answer all questions.' }));
      renderFillPage();

      expect(screen.getByText('Please answer all questions.')).toBeInTheDocument();
    });
  });
});
