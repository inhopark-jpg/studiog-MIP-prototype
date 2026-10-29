import { useState, type ReactNode } from 'react';
import { useLanguage } from '../i18n';
import { Asset } from './Asset';
import './ArrivalCard.css';

/** Row (70) + gap (16) + divider (2) + gap before the next row (16), per ArrivalCard.css */
const ROW_GAP = 16;
const ROW_PITCH = 70 + ROW_GAP + 2 + ROW_GAP;

type Props<T extends { id: string }> = {
  title: string;
  items: T[];
  pageSize?: number;
  renderRow: (item: T) => ReactNode;
  /** A row that was just added: opens on its page and animates in */
  newId?: string | null;
  /** Tapping a row (shows its vehicle on the map) */
  onSelect?: (item: T) => void;
};

export function ArrivalCard<T extends { id: string }>(props: Props<T>) {
  const { title, items, pageSize = 3, renderRow, newId, onSelect } = props;
  const { t } = useLanguage();
  const [page, setPage] = useState(() => {
    const index = items.findIndex((item) => item.id === newId);
    return index < 0 ? 0 : Math.floor(index / pageSize);
  });
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const visible = items.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <section className="arrival-card">
      <h2 className="arrival-card__title">{title}</h2>
      <div className="arrival-card__body">
        {/* Always a full page tall, so both columns match whatever their row counts */}
        <ul className="arrival-card__rows" style={{ minHeight: pageSize * ROW_PITCH - ROW_GAP }}>
          {visible.map((item) => (
            <li key={item.id} className={`arrival-card__item ${item.id === newId ? 'is-new' : ''}`}>
              <div className="arrival-card__row" role="button" onClick={() => onSelect?.(item)}>
                {renderRow(item)}
              </div>
              <div className="arrival-card__divider" aria-hidden />
            </li>
          ))}
        </ul>
        <div className="arrival-card__pager">
          <button className="pager-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <Asset name="icons/arrow-prev" width={26} height={26} />
            {t.prev}
          </button>
          <span className="arrival-card__page">
            {page + 1}/{pageCount}
          </span>
          <button className="pager-btn" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)}>
            {t.next}
            {/* design uses the left-pointing source icon rotated 180° */}
            <Asset name="icons/arrow-next" width={27} height={27} className="pager-btn__next-icon" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function RouteLabel({ route, variant }: { route: string; variant: 'drt' | 'bus' | 'bus-green' }) {
  return <span className={`route-label route-label--${variant}`}>{route}</span>;
}

/** 혼잡도 dots: filled up to `level` (0–2) out of 3 */
export function CrowdDots({ level }: { level: 0 | 1 | 2 }) {
  return (
    <span className="crowd-dots" aria-hidden>
      {[0, 1, 2].map((i) => (
        <Asset key={i} name={i <= level ? 'icons/dot-on' : 'icons/dot-off'} width={16} height={16} />
      ))}
    </span>
  );
}
