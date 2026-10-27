import { SNAPSHOT, type DrtArrival } from '../data/mock';
import { useLanguage } from '../i18n';
import { ArrivalCard, CrowdDots, RouteLabel } from './ArrivalCard';
import './TransitPanel.css';

type Props = {
  /** Snapshot rows plus bookings made on this kiosk */
  drt: DrtArrival[];
  /** A booking that was just made, animated into the DRT list */
  newDrtId?: string | null;
};

export function TransitPanel({ drt, newDrtId }: Props) {
  const { lang, t } = useLanguage();

  return (
    <div className="transit-panel">
      <div className="transit-panel__cards">
        <ArrivalCard
          title={t.drtTitle}
          items={drt}
          newId={newDrtId}
          renderRow={(a) => (
            <>
              <RouteLabel route={t.drtRoute(a.routeNo)} variant="drt" />
              <div className="arrival-info arrival-info--drt">
                <p className={`arrival-info__primary ${a.etaMin === 0 ? 'is-alert' : ''}`}>{t.drtEta(a.etaMin)}</p>
                <p className="arrival-info__secondary">{t.boardingNo(a.boardingNo)}</p>
              </div>
            </>
          )}
        />
        <ArrivalCard
          title={t.busTitle}
          items={SNAPSHOT.bus}
          renderRow={(b) => (
            <>
              <RouteLabel route={b.route} variant={b.color === 'green' ? 'bus-green' : 'bus'} />
              <div className="arrival-info">
                <p className="arrival-info__primary">{t.busEta(b.etaMin)}</p>
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
