import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { isRoomFree, nightsBetween } from "../domain/availability";
import { roomLine } from "../domain/rates";

const DAY = 86_400_000;
const READY = ["AVAILABLE", "CLEAN", "INSPECTED"];
const CHANGED = "This reservation was changed by someone else. Reload the page and try again.";
const manilaToday = () => new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");

const schema = z.object({
  version: z.number().int(),
  roomId: z.string().min(1),
  reason: z.string().trim().min(3).max(200),
  problem: z.enum(["AIRCON", "PLUMBING", "ELECTRICAL", "INTERNET", "FURNITURE", "APPLIANCE", "OTHER"]).optional(),
});

/** Move a checked-in guest to another room. Everything happens in one transaction. */
export async function moveRoom(id: string, raw: unknown, actor: Actor) {
  const d = schema.parse(raw);
  const today = manilaToday();
  try {
    return await prisma.$transaction(async tx => {
      const r = await tx.reservation.findUniqueOrThrow({ where: { id }, include: { room: true, roomType: true, folio: { include: { items: true } } } });
      if (r.status !== "CHECKED_IN" || !r.room || !r.folio) throw new AppError("Only guests who are checked in can be moved to another room");
      if (r.folio.closedAt) throw new AppError("This bill is closed");
      if (r.version !== d.version) throw new AppError(CHANGED);
      if (d.roomId === r.roomId) throw new AppError("The guest is already in that room", 400);
      if (r.checkOut <= today) throw new AppError("This guest is due to leave today. Check them out instead of moving them.");

      const nr = await tx.room.findUniqueOrThrow({ where: { id: d.roomId }, include: { roomType: true } });
      if (!READY.includes(nr.status)) throw new AppError(`Room ${nr.number} isn't ready (${nr.status.toLowerCase().replace("_", " ")}). Choose a clean room.`);
      if (r.adults + r.children > nr.maxOccupancy) throw new AppError(`Room ${nr.number} holds at most ${nr.maxOccupancy} guests`);
      const stays = await tx.reservation.findMany({ where: { roomId: nr.id } });
      if (!isRoomFree(nr, stays, r.checkIn, r.checkOut, id)) throw new AppError(`Room ${nr.number} isn't free for the rest of this stay`);

      const upd = await tx.reservation.updateMany({ where: { id, version: r.version }, data: { roomId: nr.id, version: { increment: 1 } } });
      if (upd.count === 0) throw new AppError(CHANGED);
      await tx.room.update({ where: { id: nr.id }, data: { status: "OCCUPIED" } });

      // The room the guest leaves: blocked and reported if it has a problem, otherwise sent to housekeeping.
      const old = r.room;
      let tail: string;
      if (d.problem) {
        await tx.room.update({ where: { id: old.id }, data: { status: "MAINTENANCE" } });
        await tx.maintenanceTicket.create({ data: { roomId: old.id, category: d.problem, priority: "HIGH", reportedById: actor.id,
          description: `Guest moved out to Room ${nr.number}: ${d.reason}` } });
        tail = `Room ${old.number} blocked and reported to maintenance`;
      } else {
        await tx.room.update({ where: { id: old.id }, data: { status: "DIRTY" } });
        await tx.housekeepingTask.create({ data: { roomId: old.id, status: "DIRTY", notes: `Guest moved to Room ${nr.number}` } });
        tail = `Room ${old.number} sent to housekeeping`;
      }

      // Bill: nights already spent stay with the old room; the rest move to the new room at the same prices. The total doesn't change.
      for (const it of r.folio.items.filter(i => i.category === "ROOM" && !i.voidedAt)) {
        const end = new Date(+it.businessDate + it.qty * DAY);
        if (end <= today) continue;
        const showRate = /@/.test(it.description);
        if (it.businessDate >= today) {
          await tx.folioItem.update({ where: { id: it.id }, data: { description: it.description.replace(/^Room \S+/, `Room ${nr.number}`) } });
          continue;
        }
        const spent = nightsBetween(it.businessDate, today), left = it.qty - spent;
        await tx.folioItem.update({ where: { id: it.id }, data: { voidedAt: new Date(), voidedById: actor.id, voidReason: `Split when the guest moved to Room ${nr.number}` } });
        const base = { folioId: it.folioId, category: "ROOM", unitAmount: it.unitAmount, postedById: actor.id };
        await tx.folioItem.create({ data: { ...base, description: roomLine(old.number, spent, it.unitAmount, showRate), qty: spent, businessDate: it.businessDate } });
        await tx.folioItem.create({ data: { ...base, description: roomLine(nr.number, left, it.unitAmount, showRate), qty: left, businessDate: today } });
      }

      const typeNote = nr.roomTypeId !== r.roomTypeId ? ` (${r.roomType.name} → ${nr.roomType.name}, booked rate kept)` : "";
      await audit(tx, actor.id, "reservation.move", "Reservation", id,
        `${actor.name} moved ${r.code} from Room ${old.number} to Room ${nr.number}${typeNote}: ${d.reason}. ${tail}`,
        { roomId: old.id }, { roomId: nr.id });
      return { ok: true };
    });
  } catch (e: any) {
    if (String(e?.message).includes("no_double_booking")) throw new AppError("That room was just booked by someone else. Choose another.");
    throw e;
  }
}