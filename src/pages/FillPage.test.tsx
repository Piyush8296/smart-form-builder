import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import FillPage from './FillPage';
import { SESSION_KEY, templateKey } from '../storage/keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { FieldKind } from '../enums';

// ---------------------------------------------------------------------------
// Module mock for useStorage — prevents setError-during-render re-render loop
// when loadTemplate returns null.
// ---------------------------------------------------------------------------

const mockLoadTemplate = vi.fn();
const mockLoadDraft = vi.fn(() => null);

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

const TEMPLATE_ID = 'tmpl-fill-smoke';

function seedSession() {
  const session = {
    userId: 'user-fill-test',
    email: 'fill@example.com',
    displayName: 'Fill User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function makeTextField(id: string, label: string, overrides: Partial<FieldConfig> = {}): FieldConfig {
  return {
    id,
    kind: FieldKind.TEXT_SINGLE,
    label,
    conditions: [],
    defaultVisible: true,
    defaultRequired: false,
    ...overrides,
  } as FieldConfig;
}

function seedTemplate(t: Template) {
  localStorage.setItem(templateKey(t.id), JSON.stringify(t));
  mockLoadTemplate.mockReturnValue(t);
}

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: TEMPLATE_ID,
    title: 'Fill Smoke Test',
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function renderFillPage(templateId: string) {
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

describe('FillPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    vi.clearAllMocks();
    // Default: no template found
    mockLoadTemplate.mockReturnValue(null);
    mockLoadDraft.mockReturnValue(null);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('template not found', () => {
    it('shows "Form not found" when the template does not exist', () => {
      // mockLoadTemplate returns null by default (set in beforeEach)
      renderFillPage('nonexistent-id');
      expect(screen.getByText(/form not found/i)).toBeInTheDocument();
    });

    it('shows a "Go home" button when the form is not found', () => {
      renderFillPage('nonexistent-id');
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });
  });

  describe('template found', () => {
    it('renders without crashing', () => {
      seedTemplate(makeTemplate());
      expect(() => renderFillPage(TEMPLATE_ID)).not.toThrow();
    });

    it('displays the form title', () => {
      seedTemplate(makeTemplate({ title: 'Customer Survey' }));
      renderFillPage(TEMPLATE_ID);
      expect(screen.getByRole('heading', { name: 'Customer Survey' })).toBeInTheDocument();
    });

    it('displays the form description when provided', () => {
      seedTemplate(makeTemplate({ description: 'Please fill this out.' }));
      renderFillPage(TEMPLATE_ID);
      expect(screen.getByText('Please fill this out.')).toBeInTheDocument();
    });

    it('renders a form field for each field in the template', () => {
      seedTemplate(makeTemplate({
        fields: [
          makeTextField('f1', 'Full name'),
          makeTextField('f2', 'Email address'),
        ],
      }));
      renderFillPage(TEMPLATE_ID);
      expect(screen.getByText('Full name')).toBeInTheDocument();
      expect(screen.getByText('Email address')).toBeInTheDocument();
    });

    it('shows a "Save PDF" button in the header', () => {
      seedTemplate(makeTemplate());
      renderFillPage(TEMPLATE_ID);
      expect(screen.getByRole('button', { name: /save pdf/i })).toBeInTheDocument();
    });
  });

  describe('submit flow', () => {
    it('shows the post-submit screen after a successful submission', async () => {
      seedTemplate(makeTemplate());
      renderFillPage(TEMPLATE_ID);

      // The form has no fields — clicking submit should succeed immediately
      const submitBtn = screen.getByRole('button', { name: /submit/i });
      await user.click(submitBtn);

      expect(screen.getByText(/response has been submitted/i)).toBeInTheDocument();
    });

    it('shows validation errors when required fields are empty', async () => {
      seedTemplate(makeTemplate({
        fields: [makeTextField('f1', 'Required field', { defaultRequired: true })],
      }));
      renderFillPage(TEMPLATE_ID);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      // Validation error should appear — required field was not filled
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('shows a progress bar when showProgressBar is enabled', () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showProgressBar: true },
        fields: [makeTextField('f1', 'Question 1')],
      }));
      renderFillPage(TEMPLATE_ID);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not show a progress bar when showProgressBar is disabled', () => {
      seedTemplate(makeTemplate({
        settings: { ...DEFAULT_TEMPLATE_SETTINGS, showProgressBar: false },
        fields: [makeTextField('f1', 'Question 1')],
      }));
      renderFillPage(TEMPLATE_ID);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('print / save PDF', () => {
    it('calls window.print when the Save PDF button is clicked', async () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      seedTemplate(makeTemplate());
      renderFillPage(TEMPLATE_ID);

      await user.click(screen.getByRole('button', { name: /save pdf/i }));

      expect(printSpy).toHaveBeenCalledOnce();
      printSpy.mockRestore();
    });
  });
});
