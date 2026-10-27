import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { placeById } from '../../booking/data';
import { PASSENGER_TYPES, SLOT_MINUTES, type Passengers } from '../../booking/state';
import { hhmm, useLanguage, type Strings } from '../../i18n';
import { Asset } from '../Asset';
import './ReservationParts.css';

/** "성인 1명, 청소년 2명": only the types with at least one passenger */
export const passengerSummary = (t: Strings, p: Passengers) =>
  t.passengerSummary(PASSENGER_TYPES.filter((type) => p[type] > 0).map((type) => [t.passengerType[type], p[type]]));

/** "11:30~12:00" */
export const slotRange = (start: number) => `${hhmm(new Date(start))}~${hhmm(new Date(start + SLOT_MINUTES * 60_000))}`;

export const timeOf = (ms: number) => hhmm(new Date(ms));

type Variant = 'popup' | 'page';

/** Radius of the dot exports' outer circle, and the space kept between it and the connector */
const DOT_RADIUS = 12;
const LINE_GAP = 8;

/**
 * Connector from the 출발지 dot to the 도착지 dot. Measured, not fixed, so it stays centered
 * on the dots and stretches when an address wraps to a second line.
 */
function useConnector() {
  const boxRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const [line, setLine] = useState<{ x: number; top: number; length: number } | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // offsetLeft/Top are in unscaled CSS px (the kiosk stage is CSS-scaled), relative to the box
    const measure = () => {
      const a = startRef.current;
      const b = endRef.current;
      if (!a || !b) return;
      const startY = a.offsetTop + a.offsetHeight / 2 + DOT_RADIUS + LINE_GAP;
      const endY = b.offsetTop + b.offsetHeight / 2 - DOT_RADIUS - LINE_GAP;
      setLine({ x: a.offsetLeft + a.offsetWidth / 2, top: startY, length: Math.max(0, endY - startY) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return { boxRef, startRef, endRef, line };
}

/** 출발지 → 도착지 box. The popup (1:20299) and page (1:19996) exports differ slightly, so each keeps its own. */
export function RouteBox({ dropoff, variant }: { dropoff: string; variant: Variant }) {
  const { lang, t } = useLanguage();
  const popup = variant === 'popup';
  const { boxRef, startRef, endRef, line } = useConnector();
  const thickness = popup ? 6 : 4;

  return (
    <div ref={boxRef} className={`route-box route-box--${variant}`}>
      <div className="route-box__row">
        <span ref={startRef} className="route-box__dot">
          <Asset name={popup ? 'booking/confirm-dot-start' : 'booking/route-dot-start'} width={28} height={28} />
        </span>
        <div className="route-box__text">
          <span className="route-box__label">{t.pickupLabel}</span>
          <span className="route-box__value">{t.reservationPickup}</span>
        </div>
      </div>
      <div className="route-box__row">
        <span ref={endRef} className="route-box__dot">
          <Asset name={popup ? 'booking/confirm-dot-end' : 'booking/route-dot-end'} width={28} height={popup ? 41 : 28} />
        </span>
        <div className="route-box__text">
          <span className="route-box__label">{t.dropoffLabel}</span>
          <span className="route-box__value">{placeById(dropoff)?.name[lang]}</span>
        </div>
      </div>
      {line && line.length > 0 && (
        // The line export is horizontal: stretch it to the length, then turn it upright
        <span className="route-box__line" style={{ left: line.x, top: line.top + line.length / 2 }} aria-hidden>
          <Asset
            name={popup ? 'booking/confirm-line' : 'booking/route-line'}
            width={line.length}
            height={thickness}
            fit="fill"
          />
        </span>
      )}
    </div>
  );
}

/** Label/value rows separated by 3px lines. The popup also draws a line after the last row. */
export function InfoList({ rows, variant }: { rows: [string, ReactNode][]; variant: Variant }) {
  return (
    <div className={`info-list info-list--${variant}`}>
      {rows.map(([label, value], i) => (
        <Fragment key={label}>
          {i > 0 && <hr className="info-list__line" />}
          <div className="info-list__row">
            <span className="info-list__label">{label}</span>
            <span className="info-list__value">{value}</span>
          </div>
        </Fragment>
      ))}
      {variant === 'popup' && <hr className="info-list__line" />}
    </div>
  );
}
