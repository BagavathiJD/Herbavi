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
  refreshUser: () => Promise<AuthUser | null>;
  setUserProfile: (profile: AuthUser) => void;
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

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const setUserProfile = useCallback((profile: AuthUser) => {
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      notice,
      logout,
      dismissNotice,
      refreshUser,
      setUserProfile,
    }),
    [user, loading, notice, logout, dismissNotice, refreshUser, setUserProfile]
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
