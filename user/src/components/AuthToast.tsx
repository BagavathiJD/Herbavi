import { useAuth } from '../context/AuthContext.tsx';

export default function AuthToast() {
  const { notice, dismissNotice } = useAuth();

  if (!notice) return null;

  return (
    <div
      className={`herbavi-auth-toast herbavi-auth-toast--${notice.type}`}
      role="status"
      onClick={dismissNotice}
    >
      <span className="herbavi-auth-toast__message">{notice.message}</span>
      <button type="button" className="herbavi-auth-toast__close" aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
