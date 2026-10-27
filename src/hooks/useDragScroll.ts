import { useEffect, type RefObject } from 'react';

/** Movement before a press becomes a drag (screen px); shorter presses stay taps. */
const DRAG_THRESHOLD = 8;
/** Inertia: velocity multiplier per 16ms frame after release */
const FRICTION = 0.95;
const MIN_VELOCITY = 0.02; // content px per ms
/** Only the last bit of the drag sets the fling speed */
const VELOCITY_WINDOW_MS = 100;

const isScrollable = (el: HTMLElement) => {
  const { overflowY } = getComputedStyle(el);
  return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
};

function scrollableAncestor(target: EventTarget | null, root: HTMLElement) {
  for (let el = target as HTMLElement | null; el && el !== root; el = el.parentElement) {
    if (isScrollable(el)) return el;
  }
  return null;
}

/**
 * Mouse press-and-drag scrolls lists like a finger does on a phone, with a fling at the end.
 * Touch input already scrolls natively. The map handles its own dragging.
 */
export function useDragScroll(rootRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let stopInertia = () => {};

    const onPointerDown = (down: PointerEvent) => {
      stopInertia();
      if (down.pointerType !== 'mouse' || down.button !== 0) return;
      if ((down.target as HTMLElement).closest('.maplibregl-map')) return;
      const el = scrollableAncestor(down.target, root);
      if (!el) return;

      // The stage is CSS-scaled: convert screen px to the element's own px
      const scale = el.getBoundingClientRect().height / el.offsetHeight || 1;
      const startY = down.clientY;
      const startTop = el.scrollTop;
      let dragging = false;
      let samples: { t: number; top: number }[] = [];

      const onMove = (move: PointerEvent) => {
        const dy = move.clientY - startY;
        if (!dragging && Math.abs(dy) < DRAG_THRESHOLD) return;
        dragging = true;
        el.scrollTop = startTop - dy / scale;
        const now = performance.now();
        samples = [...samples.filter((s) => now - s.t < VELOCITY_WINDOW_MS), { t: now, top: el.scrollTop }];
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
        if (!dragging) return;

        // A drag that started on a button must not also press it
        const swallowClick = (e: MouseEvent) => {
          e.stopPropagation();
          e.preventDefault();
        };
        window.addEventListener('click', swallowClick, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener('click', swallowClick, { capture: true }), 0);

        const first = samples[0];
        const last = samples[samples.length - 1];
        if (!first || last.t === first.t) return;
        let velocity = (last.top - first.top) / (last.t - first.t);
        let prev = performance.now();
        let frame = 0;
        const step = (now: number) => {
          const dt = now - prev;
          prev = now;
          const before = el.scrollTop;
          el.scrollTop += velocity * dt;
          velocity *= FRICTION ** (dt / 16);
          // stop when slow enough or pinned against an end
          if (Math.abs(velocity) > MIN_VELOCITY && el.scrollTop !== before) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
        stopInertia = () => cancelAnimationFrame(frame);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    };

    root.addEventListener('pointerdown', onPointerDown, true);
    return () => {
      root.removeEventListener('pointerdown', onPointerDown, true);
      stopInertia();
    };
  }, [rootRef]);
}
