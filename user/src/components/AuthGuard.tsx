import { type ReactNode, useEffect, useState } from 'react';
import { clearToken, fetchCurrentUser, getToken, hasActiveSession } from '../api/client.ts';

function normalizeRole(role: unknown): string {
  return String(role ?? '').trim().toLowerCase();
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [status, setStatus] = useState<'checking' | 'redirecting'>('checking');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!getToken() || !hasActiveSession()) {
        if (getToken()) clearToken();
        if (cancelled) return;
        setStatus('redirecting');
        window.location.replace('/');
        return;
      }

      const user = await fetchCurrentUser();

      if (cancelled) return;

      if (!user) {
        clearToken();
        setStatus('redirecting');
        window.location.replace('/');
        return;
      }

      if (normalizeRole(user.role) === 'admin') {
        setStatus('redirecting');
        window.location.replace('/');
        return;
      }

      if (normalizeRole(user.role) === 'user') {
        setAllowed(true);
        return;
      }

      setStatus('redirecting');
      window.location.replace('/');
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff',
          color: '#111',
          fontFamily: 'Manrope, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: '3px solid #e5e5e5',
              borderTopColor: '#111',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            {status === 'redirecting' ? 'Redirecting to sign in...' : 'Loading your account...'}
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
