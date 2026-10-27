import { Fragment, type ReactNode } from 'react';
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

/** 출발지 → 도착지 box. The popup (1:20299) and page (1:19996) exports differ slightly, so each keeps its own. */
export function RouteBox({ dropoff, variant }: { dropoff: string; variant: Variant }) {
  const { lang, t } = useLanguage();
  const popup = variant === 'popup';

  return (
    <div className={`route-box route-box--${variant}`}>
      <div className="route-box__row">
        <span className="route-box__dot">
          <Asset name={popup ? 'booking/confirm-dot-start' : 'booking/route-dot-start'} width={28} height={28} />
        </span>
        <div className="route-box__text">
          <span className="route-box__label">{t.pickupLabel}</span>
          <span className="route-box__value">{t.reservationPickup}</span>
        </div>
      </div>
      <div className="route-box__row">
        <span className="route-box__dot">
          <Asset name={popup ? 'booking/confirm-dot-end' : 'booking/route-dot-end'} width={28} height={popup ? 41 : 28} />
        </span>
        <div className="route-box__text">
          <span className="route-box__label">{t.dropoffLabel}</span>
          <span className="route-box__value">{placeById(dropoff)?.name[lang]}</span>
        </div>
      </div>
      <span className="route-box__line" aria-hidden>
        <Asset name={popup ? 'booking/confirm-line' : 'booking/route-line'} width={84} height={popup ? 6 : 4} />
      </span>
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
