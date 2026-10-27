import { useEffect, useState } from 'react';

/** useState backed by sessionStorage — the prototype's only "cache". Cleared when the tab closes. */
export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode etc.) — state still works in memory
    }
  }, [key, value]);

  return [value, setValue] as const;
}
