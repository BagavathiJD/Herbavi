import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearToken,
  fetchCurrentUser,
  getToken,
  type AuthUser,
} from '../api/client.ts';

export interface AuthNotice {
  type: 'success' | 'error';
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  notice: AuthNotice | null;
  logout: () => void;
  dismissNotice: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<AuthNotice | null>(null);

  const showNotice = useCallback((type: AuthNotice['type'], message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => {
      setNotice(null);
    }, 4200);
  }, []);

  const dismissNotice = useCallback(() => {
    setNotice(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!getToken()) {
        if (!cancelled) setLoading(false);
        return;
      }

      const currentUser = await fetchCurrentUser();
      if (!cancelled) {
        setUser(currentUser);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    showNotice('success', 'You have signed out successfully.');
  }, [showNotice]);

  const value = useMemo(
    () => ({
      user,
      loading,
      notice,
      logout,
      dismissNotice,
    }),
    [user, loading, notice, logout, dismissNotice]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
