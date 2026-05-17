import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { lookupByEmail, createSession, restoreSession } from '../storage/authStore';

type LoginStep = 'email' | 'name';

export function useLogin() {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<LoginStep>('email');
  const [error, setError] = useState('');

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    const existing = lookupByEmail(trimmed);
    if (existing) {
      restoreSession(existing);
      setSession(existing);
      navigate('/', { replace: true });
    } else {
      setStep('name');
    }
  }

  function submitName(e: React.FormEvent) {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) {
      setError('Enter your name.');
      return;
    }
    setError('');
    const s = createSession(email.trim().toLowerCase(), name);
    setSession(s);
    navigate('/', { replace: true });
  }

  function backToEmail() {
    setStep('email');
    setError('');
  }

  return { email, setEmail, displayName, setDisplayName, step, error, submitEmail, submitName, backToEmail };
}
