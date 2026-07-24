import { AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function AdminToast() {
  const { toast, dismissToast } = useNotification();

  if (!toast) return null;

  const styles =
    toast.type === 'success'
      ? {
          id: 'success-floating-toast',
          shell:
            'bg-emerald-950 text-emerald-100 border border-emerald-800/60 hover:border-emerald-600/50 hover:bg-emerald-900/90',
          iconShell: 'bg-emerald-900/60 text-emerald-400 border-emerald-700/50',
          label: 'Success',
          labelClass: 'text-emerald-400',
          messageClass: 'text-emerald-50',
          hintClass: 'text-emerald-500/80',
          icon: <Check className="w-4 h-4" />,
        }
      : toast.type === 'warning'
        ? {
            id: 'warning-floating-toast',
            shell:
              'bg-amber-950 text-amber-100 border border-amber-800/60 hover:border-amber-600/50 hover:bg-amber-900/90',
            iconShell: 'bg-amber-900/60 text-amber-400 border-amber-700/50',
            label: 'Low Stock Alert',
            labelClass: 'text-amber-400',
            messageClass: 'text-amber-50',
            hintClass: 'text-amber-500/80',
            icon: <AlertTriangle className="w-4 h-4" />,
          }
        : {
            id: 'error-floating-toast',
            shell:
              'bg-rose-950 text-rose-100 border border-rose-800/60 hover:border-rose-600/50 hover:bg-rose-900/90',
            iconShell: 'bg-rose-900/60 text-rose-400 border-rose-700/50',
            label: 'Error',
            labelClass: 'text-rose-400',
            messageClass: 'text-rose-50',
            hintClass: 'text-rose-500/80',
            icon: <AlertCircle className="w-4 h-4" />,
          };

  return (
    <div
      id={styles.id}
      onClick={dismissToast}
      className={`fixed bottom-6 left-6 z-[60] p-4 rounded-xl shadow-2xl max-w-sm flex items-start gap-3 select-none cursor-pointer duration-200 transition-all animate-in slide-in-from-left-4 fade-in ${styles.shell}`}
      role="status"
    >
      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 border ${styles.iconShell}`}>
        {styles.icon}
      </div>
      <div className="text-left space-y-1">
        <span className={`text-[9px] font-black font-mono uppercase tracking-widest block ${styles.labelClass}`}>
          {styles.label}
        </span>
        <p className={`text-xs font-semibold leading-snug ${styles.messageClass}`}>{toast.message}</p>
        <span className={`text-[8px] font-medium ${styles.hintClass}`}>Click to dismiss</span>
      </div>
    </div>
  );
}
