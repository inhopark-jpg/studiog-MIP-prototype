import { isUpcoming, type Reservation } from '../booking/state';
import { SNAPSHOT, type DrtArrival, type MapVehicle } from './mock';

export const reservationArrivalId = (r: Reservation) => `r${r.bookedAt}`;
export const vehicleIdFor = (arrivalId: string) => `v-${arrivalId}`;

/**
 * The 첫화면 DRT rows and map vehicles: the random snapshot plus every upcoming booking
 * made on this kiosk, so a new reservation shows up in the table and on the map.
 */
export function arrivalsWith(reservations: Reservation[], now: number) {
  const booked: DrtArrival[] = reservations
    .filter((r) => isUpcoming(r, now))
    .map((r) => ({
      id: reservationArrivalId(r),
      routeNo: r.routeNo ?? '05', // bookings cached before routes were assigned
      // Counts down from the random arrival set at booking (under 25 min), not the pickup window
      etaMin: Math.max(0, Math.ceil((r.arrivesAt - now) / 60_000)),
      boardingNo: r.boardingNo,
    }));

  const drt = [...SNAPSHOT.drt, ...booked].sort((a, b) => a.etaMin - b.etaMin);

  // A DRT route number is one van: several pickups (table rows) can share it, but the map
  // shows it once. A booking adds a van only when its route has none yet; it then sits at the
  // distance of that route's soonest pickup among the bookings. (Bus route numbers can repeat.)
  const vehicles: MapVehicle[] = [...SNAPSHOT.vehicles];
  const drtRoutesShown = new Set(vehicles.filter((v) => v.kind === 'drt').map((v) => v.routeNo));
  for (const a of [...booked].sort((x, y) => x.etaMin - y.etaMin)) {
    if (drtRoutesShown.has(a.routeNo)) continue;
    drtRoutesShown.add(a.routeNo);
    vehicles.push({ id: vehicleIdFor(a.id), kind: 'drt', routeNo: a.routeNo, etaMin: a.etaMin });
  }
  return { drt, vehicles };
}
