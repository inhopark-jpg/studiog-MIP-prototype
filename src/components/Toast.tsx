import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '../i18n';
import './Toast.css';

const ToastContext = createContext<(message: string) => void>(() => {});

/** Shows a short message at the bottom of the screen. */
export const useToast = () => useContext(ToastContext);

/** For any action whose destination screen hasn't been designed yet. */
export function useUnsupported() {
  const notify = useContext(ToastContext);
  const { t } = useLanguage();
  return useCallback(() => notify(t.unsupported), [notify, t]);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number>();

  const notify = useCallback((next: string) => {
    window.clearTimeout(timer.current);
    setMessage(next);
    timer.current = window.setTimeout(() => setMessage(null), 2400);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}
