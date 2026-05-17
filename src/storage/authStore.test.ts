import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSession, lookupByEmail, createSession, restoreSession, logout } from './authStore';
import { SESSION_KEY, USERS_KEY } from './keys';

describe('authStore', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { localStorage.clear(); });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns the stored session', () => {
      const session = { userId: 'u1', email: 'a@example.com', displayName: 'Alice', createdAt: new Date().toISOString() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      expect(getSession()?.email).toBe('a@example.com');
    });

    it('returns null on corrupted JSON', () => {
      localStorage.setItem(SESSION_KEY, 'bad{json');
      expect(getSession()).toBeNull();
    });
  });

  describe('lookupByEmail', () => {
    it('returns null when no users are stored', () => {
      expect(lookupByEmail('x@example.com')).toBeNull();
    });

    it('looks up a user by email (case-insensitive)', () => {
      const session = { userId: 'u1', email: 'alice@example.com', displayName: 'Alice', createdAt: new Date().toISOString() };
      localStorage.setItem(USERS_KEY, JSON.stringify({ 'alice@example.com': session }));
      expect(lookupByEmail('ALICE@EXAMPLE.COM')?.displayName).toBe('Alice');
    });

    it('returns null for an email not in the registry', () => {
      localStorage.setItem(USERS_KEY, JSON.stringify({ 'alice@example.com': {} }));
      expect(lookupByEmail('nobody@example.com')).toBeNull();
    });
  });

  describe('createSession', () => {
    it('creates a session with a UUID userId', () => {
      const session = createSession('new@example.com', 'New User');
      expect(session.userId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('normalises email to lowercase', () => {
      const session = createSession('UPPER@EXAMPLE.COM', 'User');
      expect(session.email).toBe('upper@example.com');
    });

    it('writes the session to SESSION_KEY in localStorage', () => {
      createSession('a@example.com', 'A');
      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
      expect(JSON.parse(stored!).email).toBe('a@example.com');
    });

    it('registers the user in the USERS_KEY registry', () => {
      createSession('b@example.com', 'B');
      const users = JSON.parse(localStorage.getItem(USERS_KEY)!);
      expect(users['b@example.com']).toBeDefined();
      expect(users['b@example.com'].displayName).toBe('B');
    });

    it('adds a createdAt timestamp', () => {
      const session = createSession('c@example.com', 'C');
      expect(typeof session.createdAt).toBe('string');
      expect(new Date(session.createdAt).getTime()).not.toBeNaN();
    });
  });

  describe('restoreSession', () => {
    it('writes the given session to SESSION_KEY', () => {
      const session = { userId: 'u1', email: 'r@example.com', displayName: 'R', createdAt: new Date().toISOString() };
      restoreSession(session);
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY)!);
      expect(stored.email).toBe('r@example.com');
    });
  });

  describe('logout', () => {
    it('removes the session from localStorage', () => {
      const session = createSession('logout@example.com', 'Logout User');
      restoreSession(session);
      expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
      logout();
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it('does not remove the USERS registry on logout', () => {
      createSession('stay@example.com', 'Stay');
      logout();
      expect(localStorage.getItem(USERS_KEY)).not.toBeNull();
    });
  });
});
