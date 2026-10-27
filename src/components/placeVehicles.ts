import maplibregl, { type LngLatLike } from 'maplibre-gl';

/** OpenMapTiles road classes. Buses keep to main roads; DRT vans may also use minor streets. */
const MAIN_ROADS = ['trunk', 'primary', 'secondary', 'tertiary'];
export const ROADS_FOR = { bus: MAIN_ROADS, drt: [...MAIN_ROADS, 'minor'] };

type Point = { x: number; y: number };
type Segment = { a: Point; b: Point; length: number; roadClass: string };
export type Placement = { lngLat: maplibregl.LngLat; /** degrees clockwise from screen-up */ heading: number };
export type PlacementTarget = { distancePx: number; roadClasses: string[] };

type Box = { left: number; top: number; right: number; bottom: number };

/** Screen-space margins (CSS px of the map container) keeping vehicles and their labels readable. */
const EDGE = { left: 50, right: 230, top: 70, bottom: 50 };
const TRIES = 400;
const CLEARANCE = 12;

/** Van (64×64, centered on p) plus its label to the right — sized for the widest label. */
const vehicleBox = (p: Point): Box => ({ left: p.x - 32, top: p.y - 32, right: p.x + 32 + 190, bottom: p.y + 32 });
/** 현위치 pin and its label above the tip, sized for "You are here". */
const pinBox = (tip: Point): Box => ({ left: tip.x - 105, top: tip.y - 125, right: tip.x + 105, bottom: tip.y + 5 });
const overlaps = (a: Box, b: Box) =>
  a.left < b.right + CLEARANCE &&
  b.left < a.right + CLEARANCE &&
  a.top < b.bottom + CLEARANCE &&
  b.top < a.bottom + CLEARANCE;

function roadSegments(map: maplibregl.Map): Segment[] {
  const features = map.querySourceFeatures('openmaptiles', {
    sourceLayer: 'transportation',
    filter: ['in', ['get', 'class'], ['literal', ROADS_FOR.drt]],
  });
  const segments: Segment[] = [];
  for (const f of features) {
    const g = f.geometry;
    const lines = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const line of lines) {
      for (let i = 1; i < line.length; i++) {
        const a = map.project(line[i - 1] as [number, number]);
        const b = map.project(line[i] as [number, number]);
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (length > 20) segments.push({ a, b, length, roadClass: String(f.properties.class) });
      }
    }
  }
  return segments;
}

/** Length-weighted pick, so dense blocks of short streets don't dominate. */
function weightedPicker(segments: Segment[]) {
  const cumulative: number[] = [];
  let total = 0;
  for (const s of segments) cumulative.push((total += s.length));
  return () => {
    const r = Math.random() * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return segments[lo];
  };
}

const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

/**
 * Places each vehicle on a random visible road of an allowed class, roughly `distancePx`
 * from the stop (sooner arrivals closer), heading along the road toward the stop.
 * `placed` are vehicles already on the map, which the new ones must not cover.
 */
export function placeVehicles(
  map: maplibregl.Map,
  stop: LngLatLike,
  targets: PlacementTarget[],
  placed: Placement[] = [],
): Placement[] {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const origin = map.project(stop);
  const allSegments = roadSegments(map);
  // Everything a new vehicle must not cover: the pin, the zoom/locate controls, earlier vehicles
  const taken: Box[] = [
    pinBox(origin),
    { left: w - 120, top: 0, right: w, bottom: 270 },
    ...placed.map((p) => vehicleBox(map.project(p.lngLat))),
  ];

  const fits = (p: Point) =>
    p.x > EDGE.left &&
    p.x < w - EDGE.right &&
    p.y > EDGE.top &&
    p.y < h - EDGE.bottom &&
    !taken.some((box) => overlaps(vehicleBox(p), box));

  const place = (p: Point, heading: number): Placement => {
    taken.push(vehicleBox(p));
    return { lngLat: map.unproject([p.x, p.y]), heading };
  };

  return targets.map(({ distancePx, roadClasses }) => {
    const allowed = allSegments.filter((s) => roadClasses.includes(s.roadClass));
    // Relax step by step: allowed roads near the target distance → allowed roads anywhere → any road
    const phases = [
      { segments: allowed, tolerance: 70 },
      { segments: allowed, tolerance: Infinity },
      { segments: allSegments, tolerance: Infinity },
    ];

    for (const { segments, tolerance } of phases) {
      if (!segments.length) continue;
      const pickSegment = weightedPicker(segments);
      for (let i = 0; i < TRIES; i++) {
        const s = pickSegment();
        const t = Math.random();
        const p = { x: s.a.x + (s.b.x - s.a.x) * t, y: s.a.y + (s.b.y - s.a.y) * t };
        if (Math.abs(dist(p, origin) - distancePx) > tolerance || !fits(p)) continue;

        // drive along the segment in whichever direction approaches the stop
        let dx = s.b.x - s.a.x;
        let dy = s.b.y - s.a.y;
        if (dx * (origin.x - p.x) + dy * (origin.y - p.y) < 0) {
          dx = -dx;
          dy = -dy;
        }
        return place(p, (Math.atan2(dx, -dy) * 180) / Math.PI);
      }
    }

    // No road fits (or no road data): any clear spot in view, random heading
    for (let i = 0; i < TRIES; i++) {
      const p = {
        x: EDGE.left + Math.random() * (w - EDGE.left - EDGE.right),
        y: EDGE.top + Math.random() * (h - EDGE.top - EDGE.bottom),
      };
      if (fits(p)) return place(p, Math.random() * 360);
    }
    // Last resort: overlapping is better than a vehicle missing from the map
    return place({ x: EDGE.left + Math.random() * (w - EDGE.left - EDGE.right), y: h / 2 }, Math.random() * 360);
  });
}

/** Sooner arrivals sit closer to the stop. */
export const distanceForEta = (etaMin: number) => Math.min(130 + etaMin * 30, 380);
