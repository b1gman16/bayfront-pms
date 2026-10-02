import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { isRoomFree } from "../domain/availability";
import { formatPHP } from "../domain/folio";

const manilaToday = () => new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");

const guestSchema = z.object({
  fullName: z.string().trim().min(2).max(100), phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().optional().or(z.literal("")), address: z.string().trim().max(200).optional(),
  nationality: z.string().trim().max(50).optional() });

export const searchGuests = (q: string) => prisma.guest.findMany({
  where: q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }] } : {},
  orderBy: { fullName: "asc" }, take: 8 });

export async function createGuest(raw: unknown, actor: Actor) {
  const d = guestSchema.parse(raw);
  if (d.phone) {                                         // stop duplicate profiles
    const ex = await prisma.guest.findFirst({ where: { phone: d.phone } });
    if (ex) throw new AppError(`A guest with this phone number already exists: ${ex.fullName}. Search and select them instead.`);
  }
  return prisma.$transaction(async tx => {
    const g = await tx.guest.create({ data: { ...d, email: d.email || null } });
    await audit(tx, actor.id, "guest.create", "Guest", g.id, `${actor.name} added guest ${g.fullName}`);
    return g;
  });
}

export async function assignRoom(id: string, roomId: string, actor: Actor) {
  return prisma.$transaction(async tx => {
    const r = await tx.reservation.findUniqueOrThrow({ where: { id } });
    if (!["PENDING", "CONFIRMED"].includes(r.status)) throw new AppError("Rooms can only be changed before check-in");
    const room = await tx.room.findUniqueOrThrow({ where: { id: roomId } });
    if (room.roomTypeId !== r.roomTypeId) throw new AppError(`Room ${room.number} is a different room type than booked`);
    const stays = await tx.reservation.findMany({ where: { roomId } });
    if (!isRoomFree(room, stays, r.checkIn, r.checkOut, id)) throw new AppError(`Room ${room.number} is not available for those dates`);
    await tx.reservation.update({ where: { id }, data: { roomId, version: { increment: 1 } } });
    await audit(tx, actor.id, "reservation.room", "Reservation", id, `${actor.name} assigned Room ${room.number} to ${r.code}`);
    return { ok: true };
  });
}

const chargeSchema = z.object({
  category: z.enum(["EXTRA_BED", "FOOD_BEVERAGE", "ACTIVITY", "EQUIPMENT", "OTHER"]),
  description: z.string().trim().min(2).max(120), qty: z.number().int().min(1).max(999).default(1),
  unitPesos: z.number().positive().max(1_000_000) });

export async function postCharge(folioId: string, raw: unknown, actor: Actor) {
  const d = chargeSchema.parse(raw);
  const f = await prisma.folio.findUniqueOrThrow({ where: { id: folioId }, include: { reservation: true } });
  if (f.closedAt) throw new AppError("This folio is closed. Charges can no longer be added.");
  const unitAmount = Math.round(d.unitPesos * 100);
  return prisma.$transaction(async tx => {
    const item = await tx.folioItem.create({ data: { folioId, category: d.category, description: d.description, qty: d.qty, unitAmount, businessDate: manilaToday(), postedById: actor.id } });
    await audit(tx, actor.id, "folio.charge", "FolioItem", item.id, `${actor.name} added ${d.description} ${formatPHP(unitAmount * d.qty)} to ${f.reservation.code}`);
    return item;
  });
}