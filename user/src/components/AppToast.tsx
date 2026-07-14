import { useNotification } from '../context/NotificationContext.tsx';

export default function AppToast() {
  const { toast, dismissToast } = useNotification();

  if (!toast) return null;

  return (
    <div
      className={`herbavi-auth-toast herbavi-auth-toast--${toast.type} herbavi-app-toast`}
      role="status"
      onClick={dismissToast}
    >
      <span className="herbavi-auth-toast__message">{toast.message}</span>
      <button type="button" className="herbavi-auth-toast__close" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
