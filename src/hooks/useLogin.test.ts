import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../contexts/SessionContext';
import { useLogin } from './useLogin';
import { USERS_KEY, SESSION_KEY } from '../storage/keys';

// ---------------------------------------------------------------------------
// Router + SessionProvider wrapper
// ---------------------------------------------------------------------------

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    MemoryRouter,
    null,
    React.createElement(SessionProvider, null, children),
  );

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seedExistingUser(email: string, displayName: string) {
  const session = {
    userId: 'existing-user-id',
    email: email.toLowerCase(),
    displayName,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USERS_KEY, JSON.stringify({ [email.toLowerCase()]: session }));
  return session;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useLogin', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts on the email step with empty fields and no error', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      expect(result.current.step).toBe('email');
      expect(result.current.email).toBe('');
      expect(result.current.displayName).toBe('');
      expect(result.current.error).toBe('');
    });
  });

  describe('submitEmail — validation', () => {
    it('sets an error when email is empty', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      act(() => { result.current.submitEmail(fakeEvent); });

      expect(result.current.error).toMatch(/valid email/i);
      expect(result.current.step).toBe('email');
    });

    it('sets an error when email has no @ symbol', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('notanemail'); });

      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });

      expect(result.current.error).toMatch(/valid email/i);
    });

    it('sets an error for whitespace-only email', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('   '); });

      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });

      expect(result.current.error).toMatch(/valid email/i);
    });
  });

  describe('submitEmail — new user', () => {
    it('advances to the name step when email is valid and not previously registered', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('new@example.com'); });

      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });

      expect(result.current.step).toBe('name');
      expect(result.current.error).toBe('');
    });

    it('clears a previous error when the valid email is submitted', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // First: trigger error
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });
      expect(result.current.error).not.toBe('');

      // Then: provide valid email
      act(() => { result.current.setEmail('valid@example.com'); });
      act(() => { result.current.submitEmail(fakeEvent); });
      expect(result.current.error).toBe('');
    });
  });

  describe('submitEmail — existing user', () => {
    it('restores the session and writes it to localStorage when user already exists', () => {
      seedExistingUser('existing@example.com', 'Alice');
      const { result } = renderHook(() => useLogin(), { wrapper });

      act(() => { result.current.setEmail('existing@example.com'); });

      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });

      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
      const session = JSON.parse(stored!);
      expect(session.email).toBe('existing@example.com');
      expect(session.displayName).toBe('Alice');
    });

    it('normalises the email to lowercase before lookup', () => {
      seedExistingUser('alice@example.com', 'Alice');
      const { result } = renderHook(() => useLogin(), { wrapper });

      act(() => { result.current.setEmail('ALICE@EXAMPLE.COM'); });
      const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(fakeEvent); });

      // Existing user found — stays on email step only if navigated away; we can check session
      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
    });
  });

  describe('submitName — validation', () => {
    it('sets an error when display name is empty', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Advance to name step
      act(() => { result.current.setEmail('new@example.com'); });
      const emailEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(emailEvent); });
      expect(result.current.step).toBe('name');

      // Submit empty name
      const nameEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitName(nameEvent); });

      expect(result.current.error).toMatch(/enter your name/i);
    });

    it('sets an error for whitespace-only display name', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('new@example.com'); });
      const emailEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(emailEvent); });

      act(() => { result.current.setDisplayName('   '); });
      const nameEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitName(nameEvent); });

      expect(result.current.error).toMatch(/enter your name/i);
    });
  });

  describe('submitName — new session creation', () => {
    it('creates a session in localStorage after a valid name is submitted', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('brand-new@example.com'); });
      const emailEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(emailEvent); });

      act(() => { result.current.setDisplayName('New Person'); });
      const nameEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitName(nameEvent); });

      const stored = localStorage.getItem(SESSION_KEY);
      expect(stored).not.toBeNull();
      const session = JSON.parse(stored!);
      expect(session.email).toBe('brand-new@example.com');
      expect(session.displayName).toBe('New Person');
      expect(typeof session.userId).toBe('string');
    });

    it('stores the user in the users registry so they can log in again', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });
      act(() => { result.current.setEmail('new2@example.com'); });
      const emailEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(emailEvent); });

      act(() => { result.current.setDisplayName('Second User'); });
      const nameEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitName(nameEvent); });

      const users = JSON.parse(localStorage.getItem(USERS_KEY)!);
      expect(users['new2@example.com']).toBeDefined();
      expect(users['new2@example.com'].displayName).toBe('Second User');
    });
  });

  describe('backToEmail', () => {
    it('resets the step to email and clears the error', () => {
      const { result } = renderHook(() => useLogin(), { wrapper });

      // Advance to name step
      act(() => { result.current.setEmail('x@example.com'); });
      const emailEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;
      act(() => { result.current.submitEmail(emailEvent); });
      expect(result.current.step).toBe('name');

      act(() => { result.current.backToEmail(); });

      expect(result.current.step).toBe('email');
      expect(result.current.error).toBe('');
    });
  });
});
