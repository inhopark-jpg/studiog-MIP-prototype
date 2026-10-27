import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Asset } from './Asset';
import './OptionList.css';

export type Option<Id extends string> = { id: Id; label: ReactNode };

type Props<Id extends string> = {
  options: Option<Id>[];
  selected: Id | null;
  onSelect: (id: Id) => void;
};

const SCROLL_STEP = 122; // one option row (106) + gap (16)
// Thumb travels between the up (0–60) and down (512–572) buttons
const THUMB_RANGE = { top: 64, bottom: 508 };

/**
 * Selectable rows + the design's 60px scroll bar (Figma modal_setting body). Short lists
 * (e.g. the two languages) shrink to fit and drop the scroll bar.
 */
export function OptionList<Id extends string>({ options, selected, onSelect }: Props<Id>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ top: number; height: number } | null>(null);

  const updateThumb = () => {
    const el = listRef.current;
    if (!el || el.scrollHeight <= el.clientHeight) return setThumb(null);
    const range = THUMB_RANGE.bottom - THUMB_RANGE.top;
    const height = Math.max(80, (range * el.clientHeight) / el.scrollHeight);
    const progress = el.scrollTop / (el.scrollHeight - el.clientHeight);
    setThumb({ top: THUMB_RANGE.top + (range - height) * progress, height });
  };

  // Open with the selected row centered (scrolls only the list, never the kiosk stage)
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector<HTMLElement>('.is-selected');
    if (list && row) list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
    updateThumb();
  }, []);

  const scrollBy = (dy: number) => listRef.current?.scrollBy({ top: dy, behavior: 'smooth' });

  return (
    <div className={`option-list ${thumb ? 'is-scrollable' : ''}`}>
      <div ref={listRef} className="option-list__rows" onScroll={updateThumb}>
        {options.map((o) => {
          const isSelected = o.id === selected;
          return (
            <button
              key={o.id}
              className={`option-row ${isSelected ? 'is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(o.id)}
            >
              <span className="option-row__label">{o.label}</span>
              {isSelected && <Asset name="icons/check" width={52} height={52} />}
            </button>
          );
        })}
      </div>

      {thumb && (
        <div className="option-scrollbar" aria-hidden>
          <span className="option-scrollbar__track" />
          <span className="option-scrollbar__thumb" style={{ top: thumb.top, height: thumb.height }} />
          <button className="option-scrollbar__up" tabIndex={-1} onClick={() => scrollBy(-SCROLL_STEP)}>
            <Asset name="icons/scroll-up" width={60} height={60} />
          </button>
          <button className="option-scrollbar__down" tabIndex={-1} onClick={() => scrollBy(SCROLL_STEP)}>
            <Asset name="icons/scroll-down" width={60} height={60} />
          </button>
        </div>
      )}
    </div>
  );
}
