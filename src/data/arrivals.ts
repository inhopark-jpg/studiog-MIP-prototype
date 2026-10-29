import { isUpcoming, type Reservation } from '../booking/state';
import { busesAt, drtAt, hasLeft, type DrtArrival, type MapVehicle } from './mock';

export const reservationArrivalId = (r: Reservation) => `r${r.bookedAt}`;
export const vehicleIdFor = (arrivalId: string) => `v-${arrivalId}`;

/**
 * The 첫화면 tables and map vehicles at `now`: the live random arrivals plus every booking made
 * on this kiosk whose van hasn't left yet, so a new reservation shows up in the table and on the map.
 */
export function arrivalsWith(reservations: Reservation[], now: number) {
  const booked: DrtArrival[] = reservations
    .filter((r) => isUpcoming(r, now) && !hasLeft(r.arrivesAt, now))
    .map((r) => ({
      id: reservationArrivalId(r),
      routeNo: r.routeNo ?? '05', // bookings cached before routes were assigned
      // Counts down to the random arrival set at booking (under 25 min), not the pickup window
      arrivesAt: r.arrivesAt,
      boardingNo: r.boardingNo,
    }));

  const drt = [...drtAt(now), ...booked].sort((a, b) => a.arrivesAt - b.arrivesAt);
  const bus = busesAt(now);

  // A DRT route number is one van: several pickups (table rows) can share it, but the map
  // shows it once, heading for that route's soonest pickup. (Bus route numbers can repeat.)
  const vehicles: MapVehicle[] = [];
  const drtRoutesShown = new Set<string>();
  for (const a of drt) {
    if (drtRoutesShown.has(a.routeNo)) continue;
    drtRoutesShown.add(a.routeNo);
    vehicles.push({ id: vehicleIdFor(a.id), kind: 'drt', routeNo: a.routeNo, arrivesAt: a.arrivesAt });
  }
  for (const b of bus) {
    vehicles.push({ id: vehicleIdFor(b.id), kind: 'bus', routeNo: b.route, arrivesAt: b.arrivesAt, color: b.color });
  }
  return { drt, bus, vehicles };
}
