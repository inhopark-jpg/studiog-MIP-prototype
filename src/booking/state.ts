import { DRT_ROUTES } from '../data/mock';
import { DEFAULT_COUNTRY } from './data';

export type PassengerType = 'adult' | 'youth' | 'child';
export type Passengers = Record<PassengerType, number>;
export const PASSENGER_TYPES: PassengerType[] = ['adult', 'youth', 'child'];
/** Seats a DRT van can take in one booking */
export const MAX_PASSENGERS = 9;
export const totalPassengers = (p: Passengers) => p.adult + p.youth + p.child;

/** Everything entered during one booking; reset when the kiosk returns to the first screen. */
export type BookingState = {
  /** Dialing code without "+", or null until chosen */
  country: string | null;
  phone: string;
  code: string;
  codeRequested: boolean;
  /** Epoch ms when the sent code stops being valid; null until 인증요청 */
  codeExpiresAt: number | null;
  /** Place id from PLACES */
  dropoff: string | null;
  passengers: Passengers;
  /** Epoch ms of the chosen pickup window's start */
  slot: number | null;
};

export type BookingStep = 'phone' | 'place' | 'count' | 'time';

export const newBooking = (): BookingState => ({
  country: DEFAULT_COUNTRY,
  phone: '',
  code: '',
  codeRequested: false,
  codeExpiresAt: null,
  dropoff: null,
  passengers: { adult: 0, youth: 0, child: 0 },
  slot: null,
});

/**
 * A confirmed booking, linked to the number it was made with. Kept in memory only, so
 * 예약조회 finds it until the page is refreshed or closed.
 */
export type Reservation = {
  /** Dialing code without "+" */
  country: string;
  phone: string;
  dropoff: string;
  passengers: Passengers;
  /** Epoch ms the booking was made (예약 시간) */
  bookedAt: number;
  slot: number;
  boardingNo: string;
  /** DRT route that serves it, e.g. "05" */
  routeNo: string;
};

export const SLOT_MINUTES = 30;
const SLOT_MS = SLOT_MINUTES * 60_000;
/** The first window starts at least this long from now */
const SLOT_LEAD_MS = 10 * 60_000;

/** Consecutive 30-minute pickup windows, starting on the next half hour that's 10+ minutes away. */
export const pickupSlots = (now: number, count: number) => {
  const first = Math.ceil((now + SLOT_LEAD_MS) / SLOT_MS) * SLOT_MS;
  return Array.from({ length: count }, (_, i) => first + i * SLOT_MS);
};

const randomBoardingNo = () => String(Math.floor(Math.random() * 1000)).padStart(3, '0');
const randomRoute = () => DRT_ROUTES[Math.floor(Math.random() * DRT_ROUTES.length)];

export const makeReservation = (b: BookingState): Reservation => ({
  country: b.country ?? DEFAULT_COUNTRY,
  phone: b.phone,
  dropoff: b.dropoff!,
  passengers: b.passengers,
  bookedAt: Date.now(),
  slot: b.slot!,
  boardingNo: randomBoardingNo(),
  routeNo: randomRoute(),
});

/** The pickup window is still open (bookings drop off the 첫화면 table after it ends). */
export const isUpcoming = (r: Reservation, now: number) => r.slot + SLOT_MS > now;

/** 예약조회: the latest upcoming booking made with this exact country code + number, if any. */
export const findReservation = (all: Reservation[], country: string | null, phone: string, now: number) =>
  [...all]
    .reverse()
    .find(
      (r) =>
        r.phone === phone && (r.country ?? DEFAULT_COUNTRY) === (country ?? DEFAULT_COUNTRY) && isUpcoming(r, now),
    );

const sameReservation = (a: Reservation, b: Reservation) => a.phone === b.phone && a.bookedAt === b.bookedAt;
export const withoutReservation = (all: Reservation[], r: Reservation) => all.filter((x) => !sameReservation(x, r));
