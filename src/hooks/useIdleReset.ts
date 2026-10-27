import { useEffect, useRef } from 'react';

/** Calls onIdle after `timeoutMs` with no touch/key input — kiosks return to the first screen. */
export function useIdleReset(timeoutMs: number, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    let timer = window.setTimeout(() => onIdleRef.current(), timeoutMs);
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => onIdleRef.current(), timeoutMs);
    };

    window.addEventListener('pointerdown', restart);
    window.addEventListener('keydown', restart);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', restart);
      window.removeEventListener('keydown', restart);
    };
  }, [timeoutMs]);
}
