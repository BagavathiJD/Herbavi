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
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error';

export interface ToastNotice {
  id: number;
  type: ToastType;
  message: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface NotificationContextValue {
  toast: ToastNotice | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  dismissToast: () => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const TOAST_DURATION_MS = 3200;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: true }) | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const toastIdRef = useRef(0);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current != null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType) => {
      dismissToast();
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, type, message });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);

  const resolveConfirm = useCallback((accepted: boolean) => {
    confirmResolverRef.current?.(accepted);
    confirmResolverRef.current = null;
    setConfirmState(null);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current?.(false);
      confirmResolverRef.current = resolve;
      setConfirmState({ ...options, open: true });
    });
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current != null) {
        window.clearTimeout(toastTimerRef.current);
      }
      confirmResolverRef.current?.(false);
    };
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      toast,
      showSuccess,
      showError,
      dismissToast,
      confirm,
    }),
    [toast, showSuccess, showError, dismissToast, confirm],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {confirmState &&
        createPortal(
          <div className="herbavi-confirm-backdrop" role="presentation" onClick={() => resolveConfirm(false)}>
            <div
              className="herbavi-confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="herbavi-confirm-title"
              aria-describedby="herbavi-confirm-message"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="herbavi-confirm-title" className="herbavi-confirm-dialog__title font-instrument_serif">
                {confirmState.title}
              </h2>
              <p id="herbavi-confirm-message" className="herbavi-confirm-dialog__message font-geist">
                {confirmState.message}
              </p>
              <div className="herbavi-confirm-dialog__actions">
                <button
                  type="button"
                  className="herbavi-confirm-dialog__btn herbavi-confirm-dialog__btn--ghost font-geist"
                  onClick={() => resolveConfirm(false)}
                >
                  {confirmState.cancelLabel ?? 'Cancel'}
                </button>
                <button
                  type="button"
                  className="herbavi-confirm-dialog__btn herbavi-confirm-dialog__btn--danger font-geist"
                  onClick={() => resolveConfirm(true)}
                >
                  {confirmState.confirmLabel ?? 'Yes, remove'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
