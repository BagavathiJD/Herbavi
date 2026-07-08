import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const MAIN_LOGIN_URL = '/';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign(MAIN_LOGIN_URL);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-5">Loading account...</div>
      </section>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
