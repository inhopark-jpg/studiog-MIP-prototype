import { useEffect, useRef } from 'react';
import maplibregl, { type LngLatLike } from 'maplibre-gl';
import type { MapVehicle } from '../data/mock';
import { useLanguage, type Lang, type Strings } from '../i18n';
import { distanceForEta, placeVehicles, ROADS_FOR, type Placement } from './placeVehicles';
import { Asset, assetHtml } from './Asset';
import './TransitMap.css';

/*
 * OpenFreeMap serves OpenStreetMap data as free vector tiles (no API key).
 * "positron" is the closest style to the light-gray basemap in the Figma design;
 * "liberty" and "bright" are more colorful alternatives.
 */
const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const DEFAULT_ZOOM = 15;
/** The design places 현위치 48px below the map's vertical center. */
const MAP_PADDING = { top: 96, bottom: 0, left: 0, right: 0 };

type Props = {
  /** [lat, lng] */
  center: [number, number];
  /** Bump to recenter the map (e.g. 첫화면). */
  resetKey: number;
  /** Zoom/locate buttons offset from the top-right corner (home: 30/47, booking: 15/40) */
  controlsInset?: { top: number; right: number };
  /** One per arrival row (snapshot + bookings) */
  vehicles: MapVehicle[];
  /** A just-booked van, which pops in with its table row */
  newVehicleId?: string | null;
  /** [lat, lng] of the chosen drop-off: shows the 도착 marker and fits both stops in view */
  destination?: [number, number] | null;
};

/**
 * Room around 현위치 and 도착 when both are fitted in view: the top leaves space for the 도착
 * bubble, the right for the map controls. Shrunk on short maps so the fit never zooms way out.
 */
const FIT_PADDING = { top: 160, bottom: 50, left: 90, right: 150 };
function fitPadding(mapHeight: number) {
  // the map's own top padding (MAP_PADDING) counts against the height too
  const scale = Math.min(1, (mapHeight * 0.55) / (FIT_PADDING.top + FIT_PADDING.bottom + MAP_PADDING.top));
  return {
    top: FIT_PADDING.top * scale,
    bottom: FIT_PADDING.bottom * scale,
    left: FIT_PADDING.left,
    right: FIT_PADDING.right,
  };
}
/** map-pin-arrive export is 51.16×65.62 incl. shadow; the pin tip sits at (23.58, 55.71) */
const ARRIVE_PIN = { width: 51.1592, height: 65.6186, tipX: 23.58, tipY: 55.71 };

/** Vehicles keep their spots when the map is shown again; new ones are placed around them. */
const placementCache = new Map<string, Placement>();

const toLngLat = ([lat, lng]: [number, number]): LngLatLike => [lng, lat];

function markerElement(html: string) {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

/** Kiosk is viewed from ~1m away; the style's desktop label sizes are too small. */
const LABEL_SCALE = 1.6;

/** Multiplies the output values of a text-size (number, interpolate/step expression, or legacy stops). */
function scaleTextSize(value: unknown): unknown {
  if (typeof value === 'number') return value * LABEL_SCALE;
  if (Array.isArray(value) && (value[0] === 'interpolate' || value[0] === 'step')) {
    // interpolate: [op, interp, input, z0, v0, z1, v1, ...]; step: [op, input, v0, z1, v1, ...]
    const firstOutput = value[0] === 'interpolate' ? 4 : 2;
    return value.map((v, i) => (i >= firstOutput && (i - firstOutput) % 2 === 0 ? scaleTextSize(v) : v));
  }
  if (value && typeof value === 'object' && 'stops' in value) {
    const fn = value as { stops: [number, number][] };
    return { ...fn, stops: fn.stops.map(([z, v]) => [z, v * LABEL_SCALE]) };
  }
  return value;
}

const LABEL_FIELD: Record<Lang, unknown> = {
  ko: ['coalesce', ['get', 'name:ko'], ['get', 'name']],
  en: ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']],
};

function labelLayerIds(map: maplibregl.Map) {
  return map
    .getStyle()
    .layers.filter((layer) => layer.type === 'symbol' && map.getLayoutProperty(layer.id, 'text-field'))
    .map((layer) => layer.id);
}

/** OSM place names in the kiosk language. */
function setLabelLanguage(map: maplibregl.Map, lang: Lang) {
  for (const id of labelLayerIds(map)) map.setLayoutProperty(id, 'text-field', LABEL_FIELD[lang]);
}

/** Run once per style load — scaling is not idempotent. */
function enlargeLabels(map: maplibregl.Map) {
  for (const id of labelLayerIds(map)) {
    map.setLayoutProperty(id, 'text-size', scaleTextSize(map.getLayoutProperty(id, 'text-size') ?? 16));
  }
}

/** Marker stacking: vehicle labels above all vans, 현위치 above vehicles, 도착 on top */
const Z = { van: 1, label: 2, pin: 3, destination: 4 };

/** Matches the DRT row's animation-delay in ArrivalCard.css */
const NEW_ARRIVAL_DELAY_MS = 900;

const VEHICLE_ASSET = {
  drt: 'map/drt-vehicle',
  bus: 'map/bus-vehicle',
  'bus-green': 'map/bus-green-vehicle',
};

const vehicleLabel = (v: MapVehicle, t: Strings) => (v.kind === 'drt' ? t.drtVehicle(v.routeNo) : v.routeNo);

/**
 * Gap between a rotated van and its label. The van body is ~26×56 inside the 64px frame,
 * so its horizontal half-extent grows from 13px (heading north) to 28px (heading east/west).
 */
function labelGap(heading: number) {
  const rad = (heading * Math.PI) / 180;
  const halfExtent = 13 * Math.abs(Math.cos(rad)) + 28 * Math.abs(Math.sin(rad));
  return Math.round(halfExtent - 32 + 8);
}

export function TransitMap(props: Props) {
  const { center, resetKey, controlsInset = { top: 30, right: 47 }, vehicles, newVehicleId, destination } = props;
  const { lang, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;
  const tRef = useRef(t);
  tRef.current = t;
  // Read when the first tiles are in; the list is fixed for each mount of the map
  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;
  const newVehicleIdRef = useRef(newVehicleId);
  newVehicleIdRef.current = newVehicleId;
  // Marker label nodes, updated in place when the language changes
  const currentLabelRef = useRef<HTMLElement | null>(null);
  const vehicleLabelRefs = useRef(new Map<string, HTMLElement>());
  const destinationRef = useRef<{ marker: maplibregl.Marker; label: HTMLElement } | null>(null);

  useEffect(() => {
    const mountedAt = performance.now();
    const el = containerRef.current!;
    const map = new maplibregl.Map({
      container: el,
      style: STYLE_URL,
      center: toLngLat(center),
      zoom: DEFAULT_ZOOM,
      minZoom: 11,
      maxZoom: 19,
      pitchWithRotate: false,
      dragRotate: false,
      touchPitch: false,
      attributionControl: { compact: false },
      // Hangul is drawn locally instead of from the style's glyph server
      localIdeographFontFamily: "'Pretendard', sans-serif",
    });
    map.touchZoomRotate.disableRotation();
    map.setPadding(MAP_PADDING);
    map.on('style.load', () => {
      enlargeLabels(map);
      setLabelLanguage(map, langRef.current);
    });

    // current-stop-marker export is 53×63 incl. drop-shadow padding; the pin tip sits at y=54.5
    const pin = markerElement(`<div class="map-pin">
        <span class="map-pin__label"></span>
        ${assetHtml('map/current-location', 53, 63)}
      </div>`);
    pin.style.zIndex = String(Z.pin);
    currentLabelRef.current = pin.querySelector('.map-pin__label');
    new maplibregl.Marker({ element: pin, anchor: 'bottom', offset: [0, 8.5] })
      .setLngLat(toLngLat(center))
      .addTo(map);

    // Vehicles need road geometry, so they're placed once the first tiles have rendered.
    map.once('idle', () => {
      const shown = vehiclesRef.current;
      const unplaced = shown.filter((v) => !placementCache.has(v.id));
      const newPlacements = placeVehicles(
        map,
        toLngLat(center),
        unplaced.map((v) => ({ distancePx: distanceForEta(v.etaMin), roadClasses: ROADS_FOR[v.kind] })),
        shown.flatMap((v) => placementCache.get(v.id) ?? []),
      );
      unplaced.forEach((v, i) => placementCache.set(v.id, newPlacements[i]));

      shown.forEach((v) => {
        const { lngLat, heading } = placementCache.get(v.id)!;
        // bus-marker frame is 64×64; its export (67×100) overflows by the shadow, offset (-2, -10)
        const variant = v.kind === 'drt' ? 'drt' : v.color === 'green' ? 'bus-green' : 'bus';
        // Pops in together with its table row (NEW_ARRIVAL_DELAY_MS after 첫화면 appears)
        const isNew = v.id === newVehicleIdRef.current;
        const delay = Math.max(0, NEW_ARRIVAL_DELAY_MS - (performance.now() - mountedAt));
        const classes = `map-vehicle map-vehicle--${variant} ${isNew ? 'is-new' : ''}`;
        const animation = isNew ? `style="animation-delay: ${delay}ms"` : '';

        // Van and label are separate markers so every label stacks above every van
        const van = markerElement(`<div class="${classes}" ${animation}>
            <span class="map-vehicle__icon" style="transform: rotate(${heading}deg)">
              ${assetHtml(VEHICLE_ASSET[variant], 67, 100)}
            </span>
          </div>`);
        van.style.zIndex = String(Z.van);
        new maplibregl.Marker({ element: van, anchor: 'center' }).setLngLat(lngLat).addTo(map);

        const tag = markerElement(`<div class="${classes} map-vehicle--tag" ${animation}>
            <span class="map-vehicle__label"></span>
          </div>`);
        tag.style.zIndex = String(Z.label);
        const label = tag.querySelector<HTMLElement>('.map-vehicle__label')!;
        label.textContent = vehicleLabel(v, tRef.current);
        vehicleLabelRefs.current.set(v.id, label);
        // left edge just past the rotated van (64px frame centered on lngLat)
        new maplibregl.Marker({ element: tag, anchor: 'left', offset: [32 + labelGap(heading), 0] })
          .setLngLat(lngLat)
          .addTo(map);
      });
    });

    mapRef.current = map;
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // center is static per kiosk; recentering is driven by resetKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mapRef.current?.jumpTo({ center: toLngLat(center), zoom: DEFAULT_ZOOM });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // 도착 marker (Figma 1:20371): pops in where the chosen destination is
  const [destLat, destLng] = destination ?? [];
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const hadDestination = !!destinationRef.current;
    destinationRef.current?.marker.remove();
    destinationRef.current = null;

    if (destLat === undefined || destLng === undefined) {
      if (hadDestination) map.easeTo({ center: toLngLat(center), zoom: DEFAULT_ZOOM, duration: 400 });
      return;
    }
    const el = markerElement(`<div class="map-dest">
        <span class="map-dest__label"></span>
        ${assetHtml('booking/map-pin-arrive', ARRIVE_PIN.width, ARRIVE_PIN.height)}
      </div>`);
    el.style.zIndex = String(Z.destination);
    const label = el.querySelector<HTMLElement>('.map-dest__label')!;
    label.textContent = tRef.current.mapArrive;
    const marker = new maplibregl.Marker({ element: el, anchor: 'top-left', offset: [-ARRIVE_PIN.tipX, -ARRIVE_PIN.tipY] })
      .setLngLat([destLng, destLat])
      .addTo(map);
    destinationRef.current = { marker, label };

    // extend() orders the corners; (stop, destination) as (sw, ne) wraps the globe when the
    // destination lies west or south of the stop
    const bounds = new maplibregl.LngLatBounds().extend(toLngLat(center)).extend([destLng, destLat]);
    map.fitBounds(bounds, { padding: fitPadding(map.getContainer().clientHeight), maxZoom: DEFAULT_ZOOM, duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destLat, destLng]);

  useEffect(
    () => () => {
      destinationRef.current?.marker.remove();
      destinationRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) setLabelLanguage(map, lang);

    if (currentLabelRef.current) currentLabelRef.current.textContent = t.currentLocation;
    if (destinationRef.current) destinationRef.current.label.textContent = t.mapArrive;
    for (const v of vehiclesRef.current) {
      const label = vehicleLabelRefs.current.get(v.id);
      if (label) label.textContent = vehicleLabel(v, t);
    }
  }, [lang, t]);

  return (
    <div className="transit-map">
      <div ref={containerRef} className="transit-map__canvas" />
      <div className="transit-map__controls" style={controlsInset}>
        <button aria-label={t.zoomIn} onClick={() => mapRef.current?.zoomIn()}>
          <Asset name="map/zoom-in-horizontal" width={43} height={3} className="map-ctrl__h-line" />
          <Asset name="map/zoom-in-vertical" width={43} height={3} className="map-ctrl__v-line" />
        </button>
        <button aria-label={t.zoomOut} onClick={() => mapRef.current?.zoomOut()}>
          <Asset name="map/zoom-out" width={43} height={3} className="map-ctrl__h-line" />
        </button>
        <button
          aria-label={t.currentLocation}
          onClick={() => mapRef.current?.flyTo({ center: toLngLat(center), zoom: DEFAULT_ZOOM, duration: 600 })}
        >
          <Asset name="map/locate" width={33} height={33} className="map-ctrl__locate" />
        </button>
      </div>
    </div>
  );
}
