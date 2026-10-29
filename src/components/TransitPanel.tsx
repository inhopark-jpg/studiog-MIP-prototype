import { etaMin, type BusArrival, type DrtArrival } from '../data/mock';
import { useLanguage } from '../i18n';
import { ArrivalCard, CrowdDots, RouteLabel } from './ArrivalCard';
import './TransitPanel.css';

type Props = {
  /** Live rows plus bookings made on this kiosk */
  drt: DrtArrival[];
  bus: BusArrival[];
  /** Epoch ms the 분 전 are counted from */
  now: number;
  /** A booking that was just made, animated into the DRT list */
  newDrtId?: string | null;
  /** Tapping a row shows its vehicle on the map */
  onSelectDrt: (row: DrtArrival) => void;
  onSelectBus: (row: BusArrival) => void;
};

export function TransitPanel({ drt, bus, now, newDrtId, onSelectDrt, onSelectBus }: Props) {
  const { lang, t } = useLanguage();

  return (
    <div className="transit-panel">
      <div className="transit-panel__cards">
        <ArrivalCard
          title={t.drtTitle}
          items={drt}
          newId={newDrtId}
          onSelect={onSelectDrt}
          renderRow={(a) => (
            <>
              <RouteLabel route={t.drtRoute(a.routeNo)} variant="drt" />
              <div className="arrival-info arrival-info--drt">
                <p className={`arrival-info__primary ${etaMin(a.arrivesAt, now) === 0 ? 'is-alert' : ''}`}>
                  {t.drtEta(etaMin(a.arrivesAt, now))}
                </p>
                <p className="arrival-info__secondary">{t.boardingNo(a.boardingNo)}</p>
              </div>
            </>
          )}
        />
        <ArrivalCard
          title={t.busTitle}
          items={bus}
          onSelect={onSelectBus}
          renderRow={(b) => (
            <>
              <RouteLabel route={b.route} variant={b.color === 'green' ? 'bus-green' : 'bus'} />
              <div className="arrival-info">
                <p className="arrival-info__primary">{t.busEta(etaMin(b.arrivesAt, now))}</p>
                <div className="arrival-info__secondary">
                  {/* Figma 10:666: English shows only "Congestion" beside the dots */}
                  {lang === 'en' ? (
                    <span>{t.congestion}</span>
                  ) : (
                    <>
                      <span>{t.floor(b.lowFloor)}</span>
                      <span className="arrival-info__sep" />
                      <span>{t.crowd[b.crowd]}</span>
                    </>
                  )}
                  <CrowdDots level={b.crowd} />
                </div>
              </div>
            </>
          )}
        />
      </div>
    </div>
  );
}
