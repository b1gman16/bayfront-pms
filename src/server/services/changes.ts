import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { isRoomFree, nightsBetween } from "../domain/availability";
import { formatPHP } from "../domain/folio";

const day = (s: string) => new Date(s + "T00:00:00.000Z");
const manilaToday = () => day(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }));
const fmt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" });
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const CHANGED = "This reservation was changed by someone else. Reload the page and try again.";

const updateSchema = z.object({
  version: z.number().int(),
  checkIn: dateStr, checkOut: dateStr,
  adults: z.number().int().min(1).max(20), children: z.number().int().min(0).max(20),
  source: z.string().trim().min(1).max(30),
  roomId: z.string().optional(),
  specialRequests: z.string().trim().max(500).optional(),
  internalNotes: z.string().trim().max(500).optional(),
});

export async function updateReservation(id: string, raw: unknown, actor: Actor) {
  const d = updateSchema.parse(raw);
  const from = day(d.checkIn), to = day(d.checkOut);
  if (to <= from) throw new AppError("Check-out must be after check-in", 400);
  try {
    return await prisma.$transaction(async tx => {
      const r = await tx.reservation.findUniqueOrThrow({ where: { id }, include: { room: true, roomType: true, folio: true } });
      if (!["PENDING", "CONFIRMED", "CHECKED_IN"].includes(r.status)) throw new AppError("This reservation can no longer be edited");
      if (r.version !== d.version) throw new AppError(CHANGED);
      const inHouse = r.status === "CHECKED_IN";
      if (d.adults + d.children > r.roomType.maxOccupancy) throw new AppError(`${r.roomType.name} allows at most ${r.roomType.maxOccupancy} guests`, 400);

      if (inHouse) {
        if (from.getTime() !== r.checkIn.getTime()) throw new AppError("The arrival date can't be changed after check-in");
        if (d.roomId && d.roomId !== r.roomId) throw new AppError("Moving an in-house guest to another room isn't supported yet");
        if (to < manilaToday()) throw new AppError("Check-out can't be before today");
      }

      let roomId = r.roomId;
      let newRoomNumber = r.room?.number;
      if (!inHouse && d.roomId && d.roomId !== r.roomId) {
        const nr = await tx.room.findUniqueOrThrow({ where: { id: d.roomId } });
        if (nr.roomTypeId !== r.roomTypeId) throw new AppError(`Room ${nr.number} is a different room type than booked`);
        roomId = nr.id; newRoomNumber = nr.number;
      }
      if (roomId) {
        const room = await tx.room.findUniqueOrThrow({ where: { id: roomId } });
        const stays = await tx.reservation.findMany({ where: { roomId } });
        if (!isRoomFree(room, stays, from, to, id)) throw new AppError(`Room ${room.number} isn't available for those dates`);
      }

      const upd = await tx.reservation.updateMany({ where: { id, version: r.version }, data: {
        checkIn: from, checkOut: to, adults: d.adults, children: d.children, source: d.source, roomId,
        specialRequests: d.specialRequests || null, internalNotes: d.internalNotes || null, version: { increment: 1 } } });
      if (upd.count === 0) throw new AppError(CHANGED);

      const oldN = nightsBetween(r.checkIn, r.checkOut), newN = nightsBetween(from, to);
      if (inHouse && r.folio && oldN !== newN) {
        // Keep the old room line (voided, with a reason) and post one new line, so the history stays visible.
        await tx.folioItem.updateMany({ where: { folioId: r.folio.id, category: "ROOM", voidedAt: null },
          data: { voidedAt: new Date(), voidedById: actor.id, voidReason: `Stay changed from ${oldN} to ${newN} night(s)` } });
        await tx.folioItem.create({ data: { folioId: r.folio.id, category: "ROOM", description: `Room ${r.room?.number} × ${newN} night(s)`,
          qty: newN, unitAmount: r.ratePerNight, businessDate: r.checkIn, postedById: actor.id } });
      }

      const parts: string[] = [];
      if (from.getTime() !== r.checkIn.getTime() || to.getTime() !== r.checkOut.getTime()) parts.push(`dates ${fmt(r.checkIn)}-${fmt(r.checkOut)} → ${fmt(from)}-${fmt(to)}`);
      if (roomId !== r.roomId) parts.push(`room ${r.room?.number ?? "none"} → ${newRoomNumber}`);
      if (d.adults !== r.adults || d.children !== r.children) parts.push("guest count");
      if (d.source !== r.source || (d.specialRequests || null) !== r.specialRequests || (d.internalNotes || null) !== r.internalNotes) parts.push("details");
      if (inHouse && oldN !== newN) parts.push(`bill adjusted to ${newN} night(s) at ${formatPHP(r.ratePerNight)}`);
      await audit(tx, actor.id, "reservation.update", "Reservation", id,
        `${actor.name} changed ${r.code}${parts.length ? ": " + parts.join(", ") : " (no changes)"}`,
        { checkIn: r.checkIn, checkOut: r.checkOut, roomId: r.roomId, adults: r.adults, children: r.children },
        { checkIn: from, checkOut: to, roomId, adults: d.adults, children: d.children });
      return { ok: true };
    });
  } catch (e: any) {
    if (String(e?.message).includes("no_double_booking")) throw new AppError("That room was just booked by someone else. Pick another.");
    throw e;
  }
}

const cancelSchema = z.object({ version: z.number().int(), reason: z.string().trim().min(3).max(200) });

export async function cancelReservation(id: string, raw: unknown, actor: Actor) {
  const d = cancelSchema.parse(raw);
  return prisma.$transaction(async tx => {
    const r = await tx.reservation.findUniqueOrThrow({ where: { id }, include: { folio: { include: { payments: true } } } });
    if (!["PENDING", "CONFIRMED"].includes(r.status)) throw new AppError("Only upcoming reservations can be cancelled. Check out in-house guests instead.");
    const net = (r.folio?.payments ?? []).reduce((s, p) => s + (p.kind === "PAYMENT" ? p.amount : -p.amount), 0);
    if (net > 0) throw new AppError(`${formatPHP(net)} has been paid on this reservation. Refund it first, then cancel.`);
    const upd = await tx.reservation.updateMany({ where: { id, version: d.version },
      data: { status: "CANCELLED", cancelReason: d.reason, version: { increment: 1 } } });
    if (upd.count === 0) throw new AppError(CHANGED);
    await audit(tx, actor.id, "reservation.cancel", "Reservation", id, `${actor.name} cancelled ${r.code}: ${d.reason}`);
    return { ok: true };
  });
}

export async function markNoShow(id: string, version: number, actor: Actor) {
  return prisma.$transaction(async tx => {
    const r = await tx.reservation.findUniqueOrThrow({ where: { id } });
    if (!["PENDING", "CONFIRMED"].includes(r.status)) throw new AppError("Only upcoming reservations can be marked as no-show");
    if (r.checkIn > manilaToday()) throw new AppError("The arrival date hasn't come yet");
    const upd = await tx.reservation.updateMany({ where: { id, version }, data: { status: "NO_SHOW", version: { increment: 1 } } });
    if (upd.count === 0) throw new AppError(CHANGED);
    await audit(tx, actor.id, "reservation.noshow", "Reservation", id, `${actor.name} marked ${r.code} as a no-show`);
    return { ok: true };
  });
}