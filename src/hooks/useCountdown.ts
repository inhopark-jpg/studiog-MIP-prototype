import { useEffect, useState } from 'react';

/** Counts whole seconds down to 0, then calls `onDone`. Holds while `paused`. */
export function useCountdown(seconds: number, onDone: () => void, paused = false) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (paused) return;
    if (left === 0) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [paused, left, onDone]);

  return left;
}
