import { AlertCircle, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function AdminToast() {
  const { toast, dismissToast } = useNotification();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      id={isSuccess ? 'success-floating-toast' : 'error-floating-toast'}
      onClick={dismissToast}
      className={`fixed bottom-6 left-6 z-[60] p-4 rounded-xl shadow-2xl max-w-sm flex items-start gap-3 select-none cursor-pointer duration-200 transition-all animate-in slide-in-from-left-4 fade-in ${
        isSuccess
          ? 'bg-emerald-950 text-emerald-100 border border-emerald-800/60 hover:border-emerald-600/50 hover:bg-emerald-900/90'
          : 'bg-rose-950 text-rose-100 border border-rose-800/60 hover:border-rose-600/50 hover:bg-rose-900/90'
      }`}
      role="status"
    >
      <div
        className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${
          isSuccess
            ? 'bg-emerald-900/60 text-emerald-400 border-emerald-700/50'
            : 'bg-rose-900/60 text-rose-400 border-rose-700/50'
        }`}
      >
        {isSuccess ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </div>
      <div className="text-left space-y-1">
        <span
          className={`text-[9px] font-black font-mono uppercase tracking-widest block ${
            isSuccess ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isSuccess ? 'Success' : 'Error'}
        </span>
        <p className={`text-xs font-semibold leading-snug ${isSuccess ? 'text-emerald-50' : 'text-rose-50'}`}>
          {toast.message}
        </p>
        <span className={`text-[8px] font-medium ${isSuccess ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
          Click to dismiss
        </span>
      </div>
    </div>
  );
}
