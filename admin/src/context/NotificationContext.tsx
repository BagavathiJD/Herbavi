import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AdminToastType = 'success' | 'error' | 'warning';

export interface AdminToastNotice {
  id: number;
  type: AdminToastType;
  message: string;
}

interface NotificationContextValue {
  toast: AdminToastNotice | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<AdminToastNotice | null>(null);
  const timerRef = useRef<number | null>(null);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: AdminToastType) => {
      dismissToast();
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, type, message });
      timerRef.current = window.setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      toast,
      showSuccess,
      showError,
      showWarning,
      dismissToast,
    }),
    [toast, showSuccess, showError, showWarning, dismissToast],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
