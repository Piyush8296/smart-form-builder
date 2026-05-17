import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import LoginPage from './LoginPage';
import { SESSION_KEY, USERS_KEY } from '../storage/keys';
import React from 'react';

// ---------------------------------------------------------------------------
// Wrapper
// ---------------------------------------------------------------------------

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(
        SessionProvider,
        null,
        React.createElement(LoginPage),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('rendering', () => {
    it('renders without crashing', () => {
      renderLoginPage();
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows the email input on the initial step', () => {
      renderLoginPage();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('shows the Continue button on the email step', () => {
      renderLoginPage();
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('does not show the name input on the initial step', () => {
      renderLoginPage();
      expect(screen.queryByLabelText(/your name/i)).not.toBeInTheDocument();
    });
  });

  describe('email step', () => {
    it('shows an error when the form is submitted with an empty email', async () => {
      renderLoginPage();
      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    it('advances to the name step when a valid new email is entered', async () => {
      renderLoginPage();
      await user.type(screen.getByLabelText(/email/i), 'new@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    });

    it('shows the email as subtext on the name step', async () => {
      renderLoginPage();
      await user.type(screen.getByLabelText(/email/i), 'show@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByText('show@example.com')).toBeInTheDocument();
    });

    it('logs in an existing user without going to the name step', async () => {
      // Seed an existing user
      const existingSession = {
        userId: 'u-existing',
        email: 'existing@example.com',
        displayName: 'Existing User',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        USERS_KEY,
        JSON.stringify({ 'existing@example.com': existingSession }),
      );

      renderLoginPage();
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).email).toBe('existing@example.com');
    });
  });

  describe('name step', () => {
    async function advanceToNameStep() {
      renderLoginPage();
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.click(screen.getByRole('button', { name: /continue/i }));
    }

    it('shows the name input', async () => {
      await advanceToNameStep();
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    });

    it('shows an error when submitted without a name', async () => {
      await advanceToNameStep();
      await user.click(screen.getByRole('button', { name: /get started/i }));
      expect(screen.getByText(/enter your name/i)).toBeInTheDocument();
    });

    it('creates a session after valid name submission', async () => {
      await advanceToNameStep();
      await user.type(screen.getByLabelText(/your name/i), 'Jane Doe');
      await user.click(screen.getByRole('button', { name: /get started/i }));
      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).displayName).toBe('Jane Doe');
    });

    it('navigates back to the email step when the back button is clicked', async () => {
      await advanceToNameStep();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('redirect when already logged in', () => {
    it('renders without crashing when a session already exists', () => {
      // LoginPage triggers a navigate('/') via useEffect when a session is detected.
      // MemoryRouter can't render the home route here, but the page should not throw.
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: 'u-1',
          email: 'logged@example.com',
          displayName: 'Logged In',
          createdAt: new Date().toISOString(),
        }),
      );
      expect(() => renderLoginPage()).not.toThrow();
    });
  });
});
