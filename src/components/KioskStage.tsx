import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useDragScroll } from '../hooks/useDragScroll';
import './KioskStage.css';

const DESIGN_WIDTH = 1080;
/** Shortest stage we allow before letterboxing (e.g. landscape desktop preview). */
const MIN_DESIGN_HEIGHT = 1720;

/**
 * Renders children on a 1080px-wide canvas scaled to fit the viewport.
 * The canvas height follows the viewport's aspect ratio, so taller/shorter portrait
 * screens give the map more/less room instead of distorting the layout.
 */
export function KioskStage({ children }: { children: ReactNode }) {
  const [box, setBox] = useState({ scale: 1, height: 1920 });
  const viewportRef = useRef<HTMLDivElement>(null);
  useDragScroll(viewportRef);

  useLayoutEffect(() => {
    const update = () => {
      const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / MIN_DESIGN_HEIGHT);
      setBox({ scale, height: window.innerHeight / scale });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div ref={viewportRef} className="kiosk-viewport">
      <div
        className="kiosk-stage"
        style={{ width: DESIGN_WIDTH, height: box.height, transform: `scale(${box.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
