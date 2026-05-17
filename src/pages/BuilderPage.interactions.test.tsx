/**
 * Deeper interaction tests for BuilderPage:
 *  - Settings modal open / close
 *  - Adding a field via the bottom "Add field" button
 *  - Clicking a field card shows the ConfigPanel
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import BuilderPage from './BuilderPage';
import { SESSION_KEY, USERS_KEY, templateKey, userTemplatesKey } from '../storage/keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { FieldConfig } from '../types/fields';
import { FieldKind } from '../enums';

// ---------------------------------------------------------------------------
// dnd-kit must be mocked — jsdom has no pointer events
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
  SortableContext: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  verticalListSortingStrategy: undefined,
  sortableKeyboardCoordinates: undefined,
}));
vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => undefined } },
}));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  closestCenter: undefined,
  KeyboardSensor: class {},
  PointerSensor: class {},
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = 'user-builder-interact';
const TEMPLATE_ID = 'tmpl-builder-interact';

function seedSession() {
  const session = {
    userId: TEST_USER_ID,
    email: 'builder-interact@example.com',
    displayName: 'Builder Interact',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(USERS_KEY, JSON.stringify({ 'builder-interact@example.com': session }));
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
  localStorage.setItem(userTemplatesKey(TEST_USER_ID), JSON.stringify([t.id]));
}

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: TEMPLATE_ID,
    title: 'Interaction Test Form',
    description: '',
    fields: [],
    settings: { ...DEFAULT_TEMPLATE_SETTINGS },
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function renderBuilderPage(templateId: string) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [`/builder/${templateId}`] },
      React.createElement(
        SessionProvider,
        null,
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: '/builder/:id', element: React.createElement(BuilderPage) }),
          React.createElement(Route, { path: '/', element: React.createElement('div', null, 'Home') }),
          React.createElement(Route, { path: '/fill/:templateId', element: React.createElement('div', null, 'Fill page') }),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BuilderPage interactions', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Settings modal
  // -------------------------------------------------------------------------

  describe('settings modal', () => {
    it('opens the settings modal when the settings button is clicked', async () => {
      seedTemplate(makeTemplate());
      renderBuilderPage(TEMPLATE_ID);

      // The settings button in BuilderToolbar — find by visible text/icon
      const settingsBtn = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsBtn);

      expect(screen.getByText(/form settings/i)).toBeInTheDocument();
    });

    it('closes the settings modal when Done is clicked', async () => {
      seedTemplate(makeTemplate());
      renderBuilderPage(TEMPLATE_ID);

      await user.click(screen.getByRole('button', { name: /settings/i }));
      expect(screen.getByText(/form settings/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /done/i }));

      await waitFor(() => {
        expect(screen.queryByText(/form settings/i)).not.toBeInTheDocument();
      });
    });

    it('settings modal contains confirmation message input', async () => {
      seedTemplate(makeTemplate());
      renderBuilderPage(TEMPLATE_ID);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByText(/confirmation message/i)).toBeInTheDocument();
    });

    it('settings modal contains progress bar toggle', async () => {
      seedTemplate(makeTemplate());
      renderBuilderPage(TEMPLATE_ID);

      await user.click(screen.getByRole('button', { name: /settings/i }));

      expect(screen.getByText(/show progress bar/i)).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Adding a field
  // -------------------------------------------------------------------------

  describe('adding a field', () => {
    it('shows "No fields yet" before any field is added', () => {
      seedTemplate(makeTemplate({ fields: [] }));
      renderBuilderPage(TEMPLATE_ID);

      expect(screen.getByText(/no fields yet/i)).toBeInTheDocument();
    });

    it('the bottom "Add field" button is present in the empty state', () => {
      seedTemplate(makeTemplate({ fields: [] }));
      renderBuilderPage(TEMPLATE_ID);

      // Verify the bottom "Add field" button exists (clicking it invokes addField(FieldKind.TEXT_SINGLE)
      // which relies on a runtime value — tested in useBuilder.test.tsx instead)
      const buttons = screen.getAllByRole('button');
      const addFieldBtn = buttons.find(
        (b) => /add field/i.test(b.textContent ?? '') && !/first/i.test(b.textContent ?? ''),
      );
      expect(addFieldBtn).toBeDefined();
    });

    it('"Add your first field" button is visible in the empty state', () => {
      seedTemplate(makeTemplate({ fields: [] }));
      renderBuilderPage(TEMPLATE_ID);

      expect(screen.getByRole('button', { name: /add your first field/i })).toBeInTheDocument();
    });

    it('shows the field list when fields exist in the template', () => {
      seedTemplate(makeTemplate({ fields: [makeTextField('f1', 'Name'), makeTextField('f2', 'Email address')] }));
      renderBuilderPage(TEMPLATE_ID);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email address')).toBeInTheDocument();
      expect(screen.queryByText(/no fields yet/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Selecting a field shows ConfigPanel
  // -------------------------------------------------------------------------

  describe('selecting a field', () => {
    it('shows the placeholder "Select a field" when no field is selected', () => {
      seedTemplate(makeTemplate({ fields: [makeTextField('f1', 'Full Name')] }));
      renderBuilderPage(TEMPLATE_ID);

      expect(screen.getByText(/select a field to edit/i)).toBeInTheDocument();
    });

    it('clicking a field card reveals the ConfigPanel with Field tab', async () => {
      seedTemplate(makeTemplate({ fields: [makeTextField('f1', 'Full Name')] }));
      renderBuilderPage(TEMPLATE_ID);

      // The field card is the element showing the field label in the FieldList
      const fieldLabels = screen.getAllByText('Full Name');
      // Click on the field card (the first occurrence that is inside a button-like wrapper)
      await user.click(fieldLabels[0]);

      // ConfigPanel renders the field tab header: displays field kind and label
      await waitFor(() => {
        expect(screen.queryByText(/select a field to edit/i)).not.toBeInTheDocument();
      });
    });

    it('ConfigPanel shows Field, Logic, Validation tabs after field selection', async () => {
      seedTemplate(makeTemplate({ fields: [makeTextField('f1', 'Description')] }));
      renderBuilderPage(TEMPLATE_ID);

      await user.click(screen.getAllByText('Description')[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^field$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^logic$/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /^validation$/i })).toBeInTheDocument();
      });
    });
  });
});
