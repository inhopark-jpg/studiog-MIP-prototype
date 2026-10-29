import { STATION } from '../data/mock';
import { ROAD_PATHS } from '../data/roadPaths';

type Point = { x: number; y: number };
/** Metres east (x) / north (y) of the stop, so lengths and headings are true */
type MeasuredPath = { lngLats: [number, number][]; points: Point[]; cumulative: number[]; length: number };

const [stopLat, stopLng] = STATION.position;
const METRES_PER_LNG = 111_320 * Math.cos((stopLat * Math.PI) / 180);

const toMeasured = (path: [number, number][]): MeasuredPath => {
  const points = path.map(([lat, lng]) => ({ x: (lng - stopLng) * METRES_PER_LNG, y: (lat - stopLat) * 111_320 }));
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative.push(cumulative[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
  }
  return { lngLats: path.map(([lat, lng]) => [lng, lat]), points, cumulative, length: cumulative[cumulative.length - 1] };
};

/** Which segment the point `along` metres from the path's start is on, and how far along it */
function pointAt(points: Point[], cumulative: number[], along: number) {
  let i = 1;
  while (i < points.length - 1 && cumulative[i] < along) i++;
  const t = Math.min(1, Math.max(0, (along - cumulative[i - 1]) / (cumulative[i] - cumulative[i - 1])));
  return { i, t };
}

const PATHS = ROAD_PATHS.map(toMeasured);

/**
 * About 21 km/h, the same on every road, so distance from the stop matches the wait: a bus
 * 20 minutes out is ~7 km away. Waits longer than a path (14 km, 40 min) start at its far end.
 */
const SPEED_M_PER_MIN = 350;
const metresForEta = (etaMin: number) => Math.max(0, etaMin) * SPEED_M_PER_MIN;

/** Arrived vehicles queue back from the stop, this far apart */
const QUEUE_GAP_M = 60;

/** Vehicle id → path index. Kept for the page's lifetime so a vehicle never changes road. */
const assigned = new Map<string, number>();

type Timed = { id: string; arrivesAt: number };

/**
 * The path whose vehicles arrive furthest apart in time from this one, so vehicles sharing a
 * road stay well apart on it (one minute is SPEED_M_PER_MIN metres).
 */
function pathIndexFor(v: Timed, shown: Timed[]) {
  const existing = assigned.get(v.id);
  if (existing !== undefined) return existing;
  const gaps = PATHS.map(() => Infinity);
  for (const other of shown) {
    const i = assigned.get(other.id);
    if (i !== undefined) gaps[i] = Math.min(gaps[i], Math.abs(other.arrivesAt - v.arrivesAt));
  }
  const widest = Math.max(...gaps);
  const best = gaps.flatMap((gap, i) => (gap === widest ? [i] : []));
  const index = best[Math.floor(Math.random() * best.length)];
  assigned.set(v.id, index);
  return index;
}

export type VehiclePosition = { lngLat: [number, number]; /** degrees clockwise from north */ heading: number };

/**
 * Where each vehicle is at `now`: on its path, `arrivesAt` away from the stop at the path's end.
 * Arrived vehicles wait at the stop, later arrivals queued behind earlier ones.
 */
export function vehiclePositions(vehicles: Timed[], now: number): Map<string, VehiclePosition> {
  const queue = vehicles.filter((v) => v.arrivesAt <= now).sort((a, b) => a.arrivesAt - b.arrivesAt);
  const out = new Map<string, VehiclePosition>();
  for (const v of vehicles) {
    const path = PATHS[pathIndexFor(v, vehicles)];
    const back = v.arrivesAt <= now ? queue.indexOf(v) * QUEUE_GAP_M : metresForEta((v.arrivesAt - now) / 60_000);
    const { i, t } = pointAt(path.points, path.cumulative, path.length - back);
    const a = path.points[i - 1];
    const b = path.points[i];
    const [lngA, latA] = path.lngLats[i - 1];
    const [lngB, latB] = path.lngLats[i];
    out.set(v.id, {
      lngLat: [lngA + (lngB - lngA) * t, latA + (latB - latA) * t],
      heading: (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI,
    });
  }
  return out;
}
