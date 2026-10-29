import { useCallback, useEffect, useState } from 'react';
import {
  makeReservation,
  newBooking,
  findReservation,
  type BookingState,
  type BookingStep,
  type Reservation,
  withoutReservation,
} from './booking/state';
import { ContrastProvider, useContrast } from './contrast';
import { arrivalsWith, reservationArrivalId, vehicleIdFor } from './data/arrivals';
import { STATION } from './data/mock';
import { useIdleReset } from './hooks/useIdleReset';
import { useNow } from './hooks/useNow';
import { useSessionState } from './hooks/useSessionState';
import { LanguageProvider, useLanguage, type Lang } from './i18n';
import { AppBanner } from './components/AppBanner';
import { BottomBar } from './components/BottomBar';
import { CountScreen } from './components/booking/CountScreen';
import { PhoneScreen } from './components/booking/PhoneScreen';
import { PlaceScreen } from './components/booking/PlaceScreen';
import { NoReservationScreen } from './components/booking/NoReservationScreen';
import { ReservationScreen } from './components/booking/ReservationScreen';
import { TimeScreen } from './components/booking/TimeScreen';
import { DrtActionBar } from './components/DrtActionBar';
import { KioskStage } from './components/KioskStage';
import { LanguageModal } from './components/LanguageModal';
import { MainTabs, type MainTab } from './components/MainTabs';
import { StationHeader } from './components/StationHeader';
import { ToastProvider } from './components/Toast';
import { TransitMap } from './components/TransitMap';
import { TourPanel } from './components/TourPanel';
import { TransitPanel } from './components/TransitPanel';
import './App.css';

const IDLE_RESET_MS = 90_000;
/** Shows the road network ~1.5 km around 현위치: roughly the buses arriving within 5 minutes */
const HOME_MAP_ZOOM = 13.5;
/** Long enough for the delayed row/van entrance on 첫화면 to finish */
const NEW_ARRIVAL_CLEAR_MS = 4_000;

type Screen = 'home' | BookingStep | 'reservation' | 'no-reservation';

function Kiosk() {
  const { setLang } = useLanguage();
  const { setContrast } = useContrast();
  const [screen, setScreen] = useState<Screen>('home');
  const [tab, setTab] = useState<MainTab>('transit');
  // 예약하기 walks the whole flow; 예약조회 verifies the phone and jumps to the reservation
  const [mode, setMode] = useState<'book' | 'lookup'>('book');
  const [booking, setBooking] = useState<BookingState>(() => newBooking());
  // In memory only: a refresh (or closing the tab) clears every booking
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  // The booking just made, animated into the DRT list when 첫화면 shows next
  const [newArrivalId, setNewArrivalId] = useState<string | null>(null);
  // Bumping this remounts paged lists and recenters the map.
  const [resetKey, setResetKey] = useState(0);
  // A tapped table row: the map shows its vehicle, then returns to 현위치
  const [mapFocus, setMapFocus] = useState<{ vehicleId: string; at: number } | null>(null);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [volume, setVolume] = useSessionState('kiosk.volume', 0);

  const update = useCallback((patch: Partial<BookingState>) => setBooking((b) => ({ ...b, ...patch })), []);

  const goHome = useCallback(() => {
    setScreen('home');
    setTab('transit');
    setBooking(newBooking());
    setReservation(null);
    setResetKey((k) => k + 1);
    setMapFocus(null);
    setLangModalOpen(false);
  }, []);

  // A walk-away resets everything, including language and 고대비; 첫화면 keeps both.
  useIdleReset(IDLE_RESET_MS, () => {
    goHome();
    setLang('ko');
    setContrast(false);
  });

  // Waits count down and vehicles drive in real time
  const now = useNow().getTime();
  const arrivals = arrivalsWith(reservations, now);

  // The entrance animation plays once
  useEffect(() => {
    if (screen !== 'home' || !newArrivalId) return;
    const id = window.setTimeout(() => setNewArrivalId(null), NEW_ARRIVAL_CLEAR_MS);
    return () => window.clearTimeout(id);
  }, [screen, newArrivalId]);

  /** 관광 정보 → DRT 예약하기 passes the spot, which becomes the destination */
  const startBooking = (dropoff: string | null = null) => {
    setMode('book');
    setNewArrivalId(null);
    setBooking({ ...newBooking(), dropoff });
    setScreen('phone');
  };

  const startLookup = () => {
    setMode('lookup');
    setNewArrivalId(null);
    setScreen('phone');
  };

  const showReservation = (r: Reservation) => {
    setReservation(r);
    setScreen('reservation');
  };

  const afterPhone = () => {
    if (mode === 'book') return setScreen('place');
    const found = findReservation(reservations, booking.country, booking.phone, Date.now());
    if (found) showReservation(found);
    else setScreen('no-reservation');
  };

  const confirmBooking = () => {
    const r = makeReservation(booking);
    setReservations([...reservations, r]);
    setNewArrivalId(reservationArrivalId(r));
    showReservation(r);
  };

  const cancelReservation = () => {
    if (reservation) setReservations(withoutReservation(reservations, reservation));
    goHome();
  };

  const focusVehicle = (vehicleId: string | undefined) => {
    if (vehicleId) setMapFocus({ vehicleId, at: Date.now() });
  };

  const header = <StationHeader temperatureC={STATION.temperatureC} onLanguageClick={() => setLangModalOpen(true)} />;

  return (
    <div className="home">
      <AppBanner />
      {screen === 'home' && (
        <>
          <MainTabs tab={tab} onChange={setTab} />
          {header}
          <div className="home__content">
            {tab === 'transit' ? (
              <>
                <TransitMap
                  center={STATION.position}
                  resetKey={resetKey}
                  zoom={HOME_MAP_ZOOM}
                  vehicles={arrivals.vehicles}
                  newVehicleId={newArrivalId && vehicleIdFor(newArrivalId)}
                  focus={mapFocus}
                />
                <TransitPanel
                  key={resetKey}
                  drt={arrivals.drt}
                  bus={arrivals.bus}
                  now={now}
                  newDrtId={newArrivalId}
                  // A DRT row's van is the one map vehicle for its route
                  onSelectDrt={(row) =>
                    focusVehicle(arrivals.vehicles.find((v) => v.kind === 'drt' && v.routeNo === row.routeNo)?.id)
                  }
                  onSelectBus={(row) => focusVehicle(vehicleIdFor(row.id))}
                />
                <DrtActionBar onBook={() => startBooking()} onLookup={startLookup} />
              </>
            ) : (
              <TourPanel onBook={(spot) => startBooking(spot.id)} />
            )}
            {langModalOpen && <LanguageModal onClose={() => setLangModalOpen(false)} />}
          </div>
        </>
      )}
      {screen !== 'home' && header}
      {screen === 'phone' && <PhoneScreen booking={booking} update={update} onBack={goHome} onNext={afterPhone} />}
      {screen === 'place' && (
        <PlaceScreen
          booking={booking}
          update={update}
          onBack={() => setScreen('phone')}
          onNext={() => setScreen('count')}
        />
      )}
      {screen === 'count' && (
        <CountScreen booking={booking} update={update} onBack={() => setScreen('place')} onNext={() => setScreen('time')} />
      )}
      {screen === 'time' && (
        <TimeScreen booking={booking} update={update} onBack={() => setScreen('count')} onConfirm={confirmBooking} />
      )}
      {screen === 'reservation' && reservation && (
        <ReservationScreen reservation={reservation} onCancelReservation={cancelReservation} onHome={goHome} />
      )}
      {screen === 'no-reservation' && (
        // The number was just verified, so booking continues from the destination step
        <NoReservationScreen
          onHome={goHome}
          onBook={() => {
            setMode('book');
            setScreen('place');
          }}
        />
      )}
      {screen !== 'home' && langModalOpen && (
        <div className="screen-overlay">
          <LanguageModal onClose={() => setLangModalOpen(false)} />
        </div>
      )}
      {/* Map moves and list paging stay on 첫화면; another page or the 관광 정보 tab doesn't */}
      <BottomBar isHome={screen === 'home' && tab === 'transit'}volume={volume} onHome={goHome} onVolumeChange={setVolume} />
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useSessionState<Lang>('kiosk.lang', 'ko');
  const [contrast, setContrast] = useSessionState('kiosk.contrast', false);

  return (
    <KioskStage>
      <LanguageProvider lang={lang} setLang={setLang}>
        <ContrastProvider contrast={contrast} setContrast={setContrast}>
          <ToastProvider>
            <Kiosk />
          </ToastProvider>
        </ContrastProvider>
      </LanguageProvider>
    </KioskStage>
  );
}
