import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import InstancesPage from './InstancesPage';
import {
  SESSION_KEY,
  USERS_KEY,
  templateKey,
  instanceKey,
  instancesKey,
  userTemplatesKey,
} from '../storage/keys';
import type { Template } from '../types/template';
import { DEFAULT_TEMPLATE_SETTINGS } from '../types/template';
import type { Instance, InstanceSummary } from '../types/instance';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_USER_ID = 'user-instances-test';
const TEMPLATE_ID = 'tmpl-instances-smoke';

function seedSession() {
  const session = {
    userId: TEST_USER_ID,
    email: 'instances@example.com',
    displayName: 'Instances User',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(USERS_KEY, JSON.stringify({ 'instances@example.com': session }));
}

function makeTemplate(overrides: Partial<Template> = {}): Template {
  const now = new Date().toISOString();
  return {
    id: TEMPLATE_ID,
    title: 'Responses Test Form',
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
  localStorage.setItem(userTemplatesKey(TEST_USER_ID), JSON.stringify([t.id]));
}

function makeInstance(id: string, submittedAt = new Date().toISOString()): Instance {
  return {
    id,
    templateId: TEMPLATE_ID,
    answers: [],
    submittedAt,
    createdAt: submittedAt,
  };
}

function seedInstances(instances: Instance[]) {
  const summaries: InstanceSummary[] = instances.map((i) => ({
    id: i.id,
    templateId: i.templateId,
    submittedAt: i.submittedAt,
  }));
  localStorage.setItem(instancesKey(TEMPLATE_ID), JSON.stringify(summaries));
  for (const i of instances) {
    localStorage.setItem(instanceKey(i.id), JSON.stringify(i));
  }
}

function renderInstancesPage(templateId = TEMPLATE_ID) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries: [`/instances/${templateId}`] },
      React.createElement(
        SessionProvider,
        null,
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: '/instances/:id',
            element: React.createElement(InstancesPage),
          }),
          React.createElement(Route, { path: '/', element: React.createElement('div', null, 'Home page') }),
        ),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InstancesPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    seedSession();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      seedTemplate(makeTemplate());
      expect(() => renderInstancesPage()).not.toThrow();
    });

    it('shows the template title as the page heading', () => {
      seedTemplate(makeTemplate({ title: 'My Survey' }));
      renderInstancesPage();
      expect(screen.getByRole('heading', { name: 'My Survey' })).toBeInTheDocument();
    });

    it('shows the response count', () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('i1'), makeInstance('i2')]);
      renderInstancesPage();
      expect(screen.getByText(/2 responses/i)).toBeInTheDocument();
    });

    it('shows empty-state message when no responses exist', () => {
      seedTemplate(makeTemplate());
      renderInstancesPage();
      expect(screen.getByText(/no responses yet/i)).toBeInTheDocument();
    });

    it('renders a row for each instance', () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('inst-a'), makeInstance('inst-b')]);
      renderInstancesPage();
      expect(screen.getByText('inst-a')).toBeInTheDocument();
      expect(screen.getByText('inst-b')).toBeInTheDocument();
    });

    it('renders action buttons: Export CSV, Edit form, Open form', () => {
      seedTemplate(makeTemplate());
      renderInstancesPage();
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit form/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open form/i })).toBeInTheDocument();
    });
  });

  describe('search', () => {
    it('filters responses by instance ID', async () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('instance-abc'), makeInstance('instance-xyz')]);
      renderInstancesPage();

      const searchInput = screen.getByPlaceholderText(/search by id/i);
      await user.type(searchInput, 'abc');

      expect(screen.getByText('instance-abc')).toBeInTheDocument();
      expect(screen.queryByText('instance-xyz')).not.toBeInTheDocument();
    });

    it('shows all responses when search is cleared', async () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('inst-1'), makeInstance('inst-2')]);
      renderInstancesPage();

      const searchInput = screen.getByPlaceholderText(/search by id/i);
      await user.type(searchInput, '1');
      await user.clear(searchInput);

      expect(screen.getByText('inst-1')).toBeInTheDocument();
      expect(screen.getByText('inst-2')).toBeInTheDocument();
    });
  });

  describe('delete flow', () => {
    it('opens a confirmation modal when a Delete button is clicked', async () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('inst-del')]);
      renderInstancesPage();

      await user.click(screen.getByRole('button', { name: /delete/i }));

      expect(screen.getByText(/delete this response/i)).toBeInTheDocument();
    });

    it('closes the modal and removes the response when confirmed', async () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('inst-remove')]);
      renderInstancesPage();

      await user.click(screen.getByRole('button', { name: /delete/i }));
      // Two Delete buttons exist once modal opens — the one in the modal footer
      const modalDeleteBtns = screen.getAllByRole('button', { name: /delete/i });
      // Modal footer delete button is the last one
      await user.click(modalDeleteBtns[modalDeleteBtns.length - 1]);

      expect(screen.queryByText('inst-remove')).not.toBeInTheDocument();
      expect(screen.getByText(/no responses yet/i)).toBeInTheDocument();
    });

    it('closes the modal without deleting when Cancel is clicked', async () => {
      seedTemplate(makeTemplate());
      seedInstances([makeInstance('inst-keep')]);
      renderInstancesPage();

      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Response should still be there
      expect(screen.getByText('inst-keep')).toBeInTheDocument();
    });
  });

  describe('non-owner redirect', () => {
    it('renders without crashing when user does not own the template', () => {
      // User doesn't own this template — page should navigate away (null render)
      localStorage.setItem(userTemplatesKey(TEST_USER_ID), JSON.stringify([]));
      expect(() => renderInstancesPage()).not.toThrow();
    });
  });
});
