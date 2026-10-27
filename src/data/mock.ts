// Mock data — the prototype has no backend. Arrivals are randomized once per page load
// so the kiosk doesn't look identical on every refresh. Display text comes from i18n.tsx.

export const STATION = {
  temperatureC: 21,
  // 오송역 버스 환승센터, 청주시 흥덕구 오송읍
  position: [36.6199, 127.3262] as [number, number],
};

/** etaMin 0 = 곧 도착 */
export type DrtArrival = { id: string; routeNo: string; etaMin: number; boardingNo: string };
/** Label colors from Figma: blue routes (#0063dd) and green routes (#008616) */
export type BusColor = 'blue' | 'green';
export type BusArrival = {
  id: string;
  route: string;
  color: BusColor;
  etaMin: number;
  lowFloor: boolean;
  /** 0 = 여유, 1 = 보통, 2 = 혼잡 */
  crowd: 0 | 1 | 2;
};
/** Every arrival row is one vehicle on the map. */
export type MapVehicle =
  | { id: string; kind: 'drt'; routeNo: string; etaMin: number }
  | { id: string; kind: 'bus'; routeNo: string; etaMin: number; color: BusColor };

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

/** `count` ascending ETAs: `soon` leading zeros (곧 도착), then gaps of `step` minutes. */
function etas(count: number, soon: number, first: [number, number], step: [number, number]) {
  const out: number[] = [];
  let eta = randInt(...first);
  for (let i = 0; i < count; i++) {
    if (i < soon) {
      out.push(0);
    } else {
      out.push(eta);
      eta += randInt(...step);
    }
  }
  return out;
}

function generateDrt(): DrtArrival[] {
  let boarding = randInt(1, 20);
  const count = randInt(...DRT_COUNT);
  return etas(count, randInt(0, count), [2, 6], [2, 7]).map((etaMin, i) => {
    boarding += randInt(1, 4);
    return { id: `d${i}`, routeNo: pick(DRT_ROUTES), etaMin, boardingNo: String(boarding).padStart(3, '0') };
  });
}

function generateBus(): BusArrival[] {
  return etas(randInt(...BUS_COUNT), 0, [1, 5], [1, 8]).map((etaMin, i) => ({
    id: `b${i}`,
    ...pick(BUS_ROUTES),
    etaMin,
    lowFloor: Math.random() < 0.6,
    crowd: pick([0, 0, 1, 1, 1, 2] as const),
  }));
}

/** One map vehicle per arrival row, so the table and the map always match. */
function generateVehicles(drt: DrtArrival[], bus: BusArrival[]): MapVehicle[] {
  return [
    ...drt.map((a): MapVehicle => ({ id: `v-${a.id}`, kind: 'drt', routeNo: a.routeNo, etaMin: a.etaMin })),
    ...bus.map((b): MapVehicle => ({ id: `v-${b.id}`, kind: 'bus', routeNo: b.route, etaMin: b.etaMin, color: b.color })),
  ];
}

const drt = generateDrt();
const bus = generateBus();

/** One random snapshot per page load. */
export const SNAPSHOT = { drt, bus, vehicles: generateVehicles(drt, bus) };
