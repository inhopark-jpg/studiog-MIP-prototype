// Mock data — the prototype has no backend. Arrivals are randomized at page load so the
// kiosk doesn't look identical on every refresh, then run on in real time. Display text
// comes from i18n.tsx.

export const STATION = {
  temperatureC: 21,
  // 오송역 버스 환승센터, 청주시 흥덕구 오송읍
  position: [36.6199, 127.3262] as [number, number],
};

/** The 분 전 counts down to arrivesAt (epoch ms); 곧 도착 while the van waits at the stop */
export type DrtArrival = { id: string; routeNo: string; arrivesAt: number; boardingNo: string };
/** Label colors from Figma: blue routes (#0063dd) and green routes (#008616) */
export type BusColor = 'blue' | 'green';
export type BusArrival = {
  id: string;
  route: string;
  color: BusColor;
  /** Epoch ms; the 분 전 counts down to it */
  arrivesAt: number;
  lowFloor: boolean;
  /** 0 = 여유, 1 = 보통, 2 = 혼잡 */
  crowd: 0 | 1 | 2;
};
/** Every bus row is one vehicle on the map; a DRT van can serve several rows (one per route). */
export type MapVehicle =
  | { id: string; kind: 'drt'; routeNo: string; arrivesAt: number }
  | { id: string; kind: 'bus'; routeNo: string; arrivesAt: number; color: BusColor };

export const DRT_ROUTES = ['01', '02', '03', '05', '06'];
const BUS_ROUTES: { route: string; color: BusColor }[] = [
  { route: '511', color: 'blue' },
  { route: '502', color: 'blue' },
  { route: '503', color: 'blue' },
  { route: '505', color: 'blue' },
  { route: '747', color: 'blue' },
  { route: '7', color: 'green' },
  { route: '5234', color: 'green' },
];
// Kept small so every arrival fits on the map as a vehicle
const DRT_COUNT: [number, number] = [1, 1];
const BUS_COUNT: [number, number] = [3, 5];

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(items: T[]) => items[randInt(0, items.length - 1)];

const LOADED_AT = Date.now();
const MINUTE_MS = 60_000;
/** An arrived vehicle stays at the stop (and in the table) this long, then leaves */
const DWELL_MS = MINUTE_MS;

/** Whole minutes left, rounded up: 0 only once the vehicle has arrived */
export const etaMin = (arrivesAt: number, now: number) => Math.max(0, Math.ceil((arrivesAt - now) / MINUTE_MS));
export const hasArrived = (arrivesAt: number, now: number) => now >= arrivesAt;
export const hasLeft = (arrivesAt: number, now: number) => now >= arrivesAt + DWELL_MS;

/**
 * A random line of arrivals that runs on in real time. Each one leaves DWELL_MS after
 * arriving and a new one joins the end, so the table keeps the same number of rows.
 */
function liveQueue<T extends { arrivesAt: number }>(
  count: [number, number],
  first: [number, number],
  step: [number, number],
  make: (arrivesAt: number) => T,
) {
  const queue: T[] = [];
  let eta = randInt(...first);
  for (let i = randInt(...count); i > 0; i--) {
    queue.push(make(LOADED_AT + eta * MINUTE_MS));
    eta += randInt(...step);
  }
  return (now: number): T[] => {
    while (queue.length && hasLeft(queue[0].arrivesAt, now)) {
      queue.shift();
      const last = queue[queue.length - 1]?.arrivesAt ?? now;
      queue.push(make(Math.max(last, now) + randInt(...step) * MINUTE_MS));
    }
    return [...queue];
  };
}

let drtSeq = 0;
let boarding = randInt(1, 20);
/** The DRT table at `now` (bookings are added in arrivals.ts) */
export const drtAt = liveQueue(DRT_COUNT, [2, 6], [2, 7], (arrivesAt): DrtArrival => {
  boarding += randInt(1, 4);
  return { id: `d${drtSeq++}`, routeNo: pick(DRT_ROUTES), arrivesAt, boardingNo: String(boarding).padStart(3, '0') };
});

let busSeq = 0;
/** The bus table at `now` */
export const busesAt = liveQueue(BUS_COUNT, [1, 5], [1, 8], (arrivesAt): BusArrival => ({
  id: `b${busSeq++}`,
  ...pick(BUS_ROUTES),
  arrivesAt,
  lowFloor: Math.random() < 0.6,
  crowd: pick([0, 0, 1, 1, 1, 2] as const),
}));
