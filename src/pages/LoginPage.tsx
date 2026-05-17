import { useEffect } from 'react';
import { Brand } from '../components/ui/Brand';
import { Button } from '../components/ui/Button';
import { useSession } from '../contexts/SessionContext';
import { useLogin } from '../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session } = useSession();
  const { email, setEmail, displayName, setDisplayName, step, error, submitEmail, submitName, backToEmail } = useLogin();

  useEffect(() => {
    if (session) navigate('/', { replace: true });
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand noLink />
        </div>
        <div className="bg-surface border border-border rounded-xl px-8 py-8">
          {step === 'email' ? (
            <form onSubmit={submitEmail} className="flex flex-col gap-4">
              <div>
                <h1 className="text-title font-semibold m-0 mb-1">Sign in</h1>
                <p className="text-muted text-sm m-0">Enter your email to continue</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-ui font-medium text-ink" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                {error && <p className="text-danger text-sm m-0">{error}</p>}
              </div>
              <Button variant="primary" type="submit" className="w-full justify-center">
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={submitName} className="flex flex-col gap-4">
              <div>
                <h1 className="text-title font-semibold m-0 mb-1">Create account</h1>
                <p className="text-muted text-sm m-0">{email}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-ui font-medium text-ink" htmlFor="name">Your name</label>
                <input
                  id="name"
                  className="input"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
                {error && <p className="text-danger text-sm m-0">{error}</p>}
              </div>
              <Button variant="primary" type="submit" className="w-full justify-center">
                Get started
              </Button>
              <button
                type="button"
                className="text-sm text-muted hover:text-ink transition-colors"
                onClick={backToEmail}
              >
                ← Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
