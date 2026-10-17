import type { Prisma, RateRule } from "@prisma/client";
import { bandsOf, priceNights, sumRates, RateRuleLite } from "../domain/rates";

type Db = Prisma.TransactionClient;

export const toLite = (r: RateRule): RateRuleLite => ({
  roomTypeId: r.roomTypeId, name: r.name, startDate: r.startDate, endDate: r.endDate, days: r.days, rate: r.rate, priority: r.priority, active: r.active });

/** Price a stay with the rate rules that are turned on right now. */
export async function quote(db: Db, roomTypeId: string, checkIn: Date, checkOut: Date) {
  const [type, rules] = await Promise.all([
    db.roomType.findUniqueOrThrow({ where: { id: roomTypeId } }),
    db.rateRule.findMany({ where: { active: true } }),
  ]);
  const nights = priceNights(type.baseRate, rules.map(toLite), roomTypeId, checkIn, checkOut);
  return { nights, total: sumRates(nights.map(n => n.rate)), bands: bandsOf(nights, checkIn), base: type.baseRate };
}