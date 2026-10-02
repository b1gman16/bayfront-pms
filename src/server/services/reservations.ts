import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { isRoomFree, nightsBetween } from "../domain/availability";
import { computeFolio, formatPHP } from "../domain/folio";
import { can } from "../domain/permissions";

const day = (s: string) => new Date(s + "T00:00:00.000Z");
export const createSchema = z.object({
  guestId: z.string().min(1), roomTypeId: z.string().min(1), roomId: z.string().optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.number().int().min(1), children: z.number().int().min(0).default(0),
  source: z.string().default("WALK_IN"), specialRequests: z.string().optional(),
});

export async function createReservation(raw: unknown, actor: Actor) {
  const d = createSchema.parse(raw);
  const from = day(d.checkIn), to = day(d.checkOut);
  if (to <= from) throw new AppError("Check-out must be after check-in", 400);
  try {
    return await prisma.$transaction(async tx => {
      const type = await tx.roomType.findUniqueOrThrow({ where: { id: d.roomTypeId } });
      if (d.adults + d.children > type.maxOccupancy) throw new AppError(`Max ${type.maxOccupancy} guests for ${type.name}`, 400);
      if (d.roomId) {
        const room = await tx.room.findUniqueOrThrow({ where: { id: d.roomId } });
        const stays = await tx.reservation.findMany({ where: { roomId: room.id } });
        if (!isRoomFree(room, stays, from, to)) throw new AppError(`Room ${room.number} is not available for those dates`);
      }
      const last = await tx.reservation.aggregate({ _count: true });
      const code = `BR-${1000 + last._count + 1}`;
      const r = await tx.reservation.create({ data: { code, guestId: d.guestId, roomTypeId: d.roomTypeId,
        roomId: d.roomId, checkIn: from, checkOut: to, adults: d.adults, children: d.children, source: d.source,
        specialRequests: d.specialRequests, ratePerNight: type.baseRate, status: "CONFIRMED", createdById: actor.id } });
      await audit(tx, actor.id, "reservation.create", "Reservation", r.id, `${actor.name} created ${code}`, undefined, r);
      return r;
    });
  } catch (e: any) {                       // DB exclusion constraint = last line of defence against races
    if (String(e?.message).includes("no_double_booking")) throw new AppError("That room was just booked by someone else. Pick another.");
    throw e;
  }
}

export async function checkIn(id: string, version: number, override: boolean, actor: Actor) {
  return prisma.$transaction(async tx => {
    const r = await tx.reservation.findUniqueOrThrow({ where: { id }, include: { room: true } });
    if (!["PENDING", "CONFIRMED"].includes(r.status)) throw new AppError(`Reservation is ${r.status}, cannot check in`);
    if (!r.room) throw new AppError("Assign a room before check-in", 400);
    if (!["AVAILABLE", "CLEAN", "INSPECTED", "RESERVED"].includes(r.room.status)) {
      if (!(override && can(actor.role, "checkout.override"))) throw new AppError(`Room ${r.room.number} is ${r.room.status}, not ready`);
    }
    const upd = await tx.reservation.updateMany({ where: { id, version }, data: { status: "CHECKED_IN", checkedInAt: new Date(), version: { increment: 1 } } });
    if (upd.count === 0) throw new AppError("This reservation was changed by someone else. Reload and retry.");
    await tx.room.update({ where: { id: r.room.id }, data: { status: "OCCUPIED" } });
    const folio = await tx.folio.upsert({ where: { reservationId: id }, create: { reservationId: id }, update: {} });
    const has = await tx.folioItem.count({ where: { folioId: folio.id, category: "ROOM" } });
    if (!has) await tx.folioItem.create({ data: { folioId: folio.id, category: "ROOM", description: `Room ${r.room.number} x ${nightsBetween(r.checkIn, r.checkOut)} nights`,
      qty: nightsBetween(r.checkIn, r.checkOut), unitAmount: r.ratePerNight, businessDate: r.checkIn, postedById: actor.id } });
    await audit(tx, actor.id, "checkin", "Reservation", id, `${actor.name} checked in ${r.code} to Room ${r.room.number}`);
    return { folioId: folio.id };
  });
}

export async function getFolioTotals(folioId: string) {
  const f = await prisma.folio.findUniqueOrThrow({ where: { id: folioId }, include: { items: true, payments: true } });
  const rules = await prisma.feeRule.findMany();
  return { folio: f, totals: computeFolio(f.items.map(i => ({ ...i, voided: !!i.voidedAt })), rules, f.payments) };
}

export async function checkOut(id: string, override: boolean, actor: Actor) {
  const r = await prisma.reservation.findUniqueOrThrow({ where: { id }, include: { folio: true, room: true } });
  if (r.status !== "CHECKED_IN" || !r.folio || !r.room) throw new AppError("Only checked-in guests can be checked out");
  const { totals } = await getFolioTotals(r.folio.id);
  if (totals.balance > 0 && !(override && can(actor.role, "checkout.override")))
    throw new AppError(`Unpaid balance ${formatPHP(totals.balance)}. Settle payment first.`, 409, totals);
  return prisma.$transaction(async tx => {
    await tx.reservation.update({ where: { id }, data: { status: "CHECKED_OUT", checkedOutAt: new Date(), checkedOutById: actor.id, version: { increment: 1 } } });
    await tx.folio.update({ where: { id: r.folio!.id }, data: { closedAt: new Date(), closedById: actor.id } });
    await tx.room.update({ where: { id: r.room!.id }, data: { status: "DIRTY" } });
    await tx.housekeepingTask.create({ data: { roomId: r.room!.id, status: "DIRTY" } });
    await audit(tx, actor.id, "checkout", "Reservation", id, `${actor.name} checked out ${r.code}; balance ${formatPHP(totals.balance)}`, undefined, totals);
    return { totals };
  });
}

export const paymentSchema = z.object({ amount: z.number().int().positive(), method: z.string().min(1),
  reference: z.string().optional(), idempotencyKey: z.string().min(8), notes: z.string().optional() });

export async function recordPayment(folioId: string, raw: unknown, actor: Actor) {
  const d = paymentSchema.parse(raw);
  const dup = await prisma.payment.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (dup) return dup;                                   // double-tap / retry returns the same payment
  const f = await prisma.folio.findUniqueOrThrow({ where: { id: folioId }, include: { reservation: true } });
  if (f.closedAt) throw new AppError("Folio is closed");
  return prisma.$transaction(async tx => {
    const p = await tx.payment.create({ data: { ...d, folioId, receivedById: actor.id } });
    await audit(tx, actor.id, "payment.record", "Payment", p.id, `${actor.name} recorded ${formatPHP(d.amount)} ${d.method} for ${f.reservation.code}`);
    return p;
  });
}
