import { SESSION_KEY, USERS_KEY } from './keys';

export interface Session {
  userId: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function getUsers(): Record<string, Session> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Session>) : {};
  } catch {
    return {};
  }
}

export function lookupByEmail(email: string): Session | null {
  return getUsers()[email.toLowerCase()] ?? null;
}

export function createSession(email: string, displayName: string): Session {
  const session: Session = {
    userId: crypto.randomUUID(),
    email: email.toLowerCase(),
    displayName,
    createdAt: new Date().toISOString(),
  };
  const users = getUsers();
  users[session.email] = session;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function restoreSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}
