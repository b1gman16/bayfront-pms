export interface RateRuleLite { roomTypeId: string | null; name: string; startDate: Date | null; endDate: Date | null; days: number[]; rate: number; priority: number; active: boolean }
export interface Night { rate: number; name: string | null }
export interface Band { start: Date; nights: number; rate: number; name: string | null }

const DAY = 86_400_000;
const peso = new Intl.NumberFormat("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** The price of one night. The matching rule with the highest priority wins; with no match, the room type's base rate applies. */
export function nightRate(base: number, rules: RateRuleLite[], roomTypeId: string, night: Date): Night {
  const hit = rules
    .filter(r => r.active && (!r.roomTypeId || r.roomTypeId === roomTypeId)
      && (!r.startDate || r.startDate <= night) && (!r.endDate || r.endDate >= night)
      && (r.days.length === 0 || r.days.includes(night.getUTCDay())))
    .sort((a, b) => b.priority - a.priority || a.name.localeCompare(b.name))[0];
  return hit ? { rate: hit.rate, name: hit.name } : { rate: base, name: null };
}

/** One price per night, from check-in up to (not including) the check-out day. */
export function priceNights(base: number, rules: RateRuleLite[], roomTypeId: string, checkIn: Date, checkOut: Date): Night[] {
  const out: Night[] = [];
  for (let t = +checkIn; t < +checkOut; t += DAY) out.push(nightRate(base, rules, roomTypeId, new Date(t)));
  return out;
}

/** Groups consecutive nights with the same price into lines for the bill. */
export function bandsOf(nights: { rate: number; name?: string | null }[], start: Date): Band[] {
  const bands: Band[] = [];
  nights.forEach((n, i) => {
    const last = bands[bands.length - 1];
    if (last && last.rate === n.rate && last.name === (n.name ?? null)) last.nights++;
    else bands.push({ start: new Date(+start + i * DAY), nights: 1, rate: n.rate, name: n.name ?? null });
  });
  return bands;
}

/** The price of each night of a reservation. Older reservations without saved prices use their single nightly rate. */
export function ratesFor(r: { nightly: unknown; ratePerNight: number; checkIn: Date; checkOut: Date }): number[] {
  const n = Math.round((+r.checkOut - +r.checkIn) / DAY);
  const s = r.nightly;
  return Array.isArray(s) && s.length === n && s.every(x => Number.isInteger(x)) ? (s as number[]) : Array(n).fill(r.ratePerNight);
}

/** New dates for an existing stay: nights that were already priced keep their price; new nights use today's prices. */
export function repriceNights(oldIn: Date, oldRates: number[], newIn: Date, newOut: Date, fresh: (night: Date) => number): number[] {
  const out: number[] = [];
  for (let t = +newIn; t < +newOut; t += DAY) {
    const i = Math.round((t - +oldIn) / DAY);
    out.push(i >= 0 && i < oldRates.length ? oldRates[i] : fresh(new Date(t)));
  }
  return out;
}

export const sumRates = (a: number[]) => a.reduce((x, y) => x + y, 0);

export const roomLine = (room: string, nights: number, rate: number, showRate: boolean) =>
  `Room ${room} × ${nights} night${nights === 1 ? "" : "s"}${showRate ? ` @ ₱${peso.format(rate / 100)}` : ""}`;