import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.tsx';

const ADMIN_LOGIN_URL = '/admin';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.assign(ADMIN_LOGIN_URL);
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
