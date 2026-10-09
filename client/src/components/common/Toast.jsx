import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
let id = 0;

const styles = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-accent-blue',
};

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), []);

  const push = useCallback(
    (type, message) => {
      const tid = ++id;
      setToasts((t) => [...t, { id: tid, type, message }]);
      setTimeout(() => dismiss(tid), 4500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-80 flex-col gap-2 outline-none"
      >
        {toasts.map((t) => {
          const Icon = icons[t.type] || Info;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-lift animate-fade-up"
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles[t.type]}`} />
              <p className="flex-1 text-sm text-navy">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-muted hover:bg-slate-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
