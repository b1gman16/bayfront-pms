import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { formatPHP } from "../domain/folio";

const typeSchema = z.object({
  name: z.string().trim().min(2).max(60),
  ratePesos: z.number().positive().max(1_000_000),
  maxOccupancy: z.number().int().min(1).max(20),
  description: z.string().trim().max(300).optional(),
  active: z.boolean().default(true),
});

const roomSchema = z.object({
  number: z.string().trim().min(1).max(10),
  roomTypeId: z.string().min(1),
  floor: z.string().trim().max(20).optional(),
  maxOccupancy: z.number().int().min(1).max(20),
  amenities: z.array(z.string().trim().min(1)).max(20).default([]),
  notes: z.string().trim().max(300).optional(),
  status: z.enum(["CLEAN", "DIRTY", "MAINTENANCE", "OUT_OF_ORDER"]).optional(),
});

const centavos = (pesos: number) => Math.round(pesos * 100);
const lbl = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());

function dup(e: any, message: string): never {
  if (e?.code === "P2002") throw new AppError(message);
  throw e;
}

export async function createRoomType(raw: unknown, actor: Actor) {
  const d = typeSchema.parse(raw);
  try {
    return await prisma.$transaction(async tx => {
      const t = await tx.roomType.create({ data: { name: d.name, baseRate: centavos(d.ratePesos), maxOccupancy: d.maxOccupancy, description: d.description || null, active: d.active } });
      await audit(tx, actor.id, "roomtype.create", "RoomType", t.id, `${actor.name} added room type ${t.name} at ${formatPHP(t.baseRate)}/night`, undefined, t);
      return { type: t };
    });
  } catch (e) { dup(e, `A room type named "${d.name}" already exists`); }
}

export async function updateRoomType(id: string, raw: unknown, actor: Actor) {
  const d = typeSchema.parse(raw);
  try {
    return await prisma.$transaction(async tx => {
      const before = await tx.roomType.findUniqueOrThrow({ where: { id } });
      const t = await tx.roomType.update({ where: { id }, data: { name: d.name, baseRate: centavos(d.ratePesos), maxOccupancy: d.maxOccupancy, description: d.description || null, active: d.active } });
      const parts: string[] = [];
      if (before.name !== t.name) parts.push(`renamed from ${before.name}`);
      if (before.baseRate !== t.baseRate) parts.push(`rate ${formatPHP(before.baseRate)} → ${formatPHP(t.baseRate)}`);
      if (before.maxOccupancy !== t.maxOccupancy) parts.push(`max guests ${before.maxOccupancy} → ${t.maxOccupancy}`);
      if (before.active !== t.active) parts.push(t.active ? "activated" : "deactivated");
      await audit(tx, actor.id, "roomtype.update", "RoomType", id, `${actor.name} updated room type ${t.name}${parts.length ? ": " + parts.join(", ") : ""}`, before, t);
      return { type: t };
    });
  } catch (e) { dup(e, `A room type named "${d.name}" already exists`); }
}

export async function createRoom(raw: unknown, actor: Actor) {
  const d = roomSchema.parse(raw);
  try {
    return await prisma.$transaction(async tx => {
      const r = await tx.room.create({ data: { number: d.number, roomTypeId: d.roomTypeId, floor: d.floor || null, maxOccupancy: d.maxOccupancy, amenities: d.amenities, notes: d.notes || null, status: d.status ?? "CLEAN" } });
      await audit(tx, actor.id, "room.create", "Room", r.id, `${actor.name} added Room ${r.number}`, undefined, r);
      return { room: r };
    });
  } catch (e) { dup(e, `Room number ${d.number} already exists`); }
}

export async function updateRoom(id: string, raw: unknown, actor: Actor) {
  const d = roomSchema.parse(raw);
  try {
    return await prisma.$transaction(async tx => {
      const before = await tx.room.findUniqueOrThrow({ where: { id } });
      let warning: string | undefined;
      if (d.status && d.status !== before.status) {
        if (before.status === "OCCUPIED") throw new AppError(`Room ${before.number} has a guest in it. Check the guest out first.`);
        if (d.status === "MAINTENANCE" || d.status === "OUT_OF_ORDER") {
          const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
          const n = await tx.reservation.count({ where: { roomId: id, status: { in: ["PENDING", "CONFIRMED"] }, checkOut: { gt: today } } });
          if (n > 0) warning = `${n} upcoming reservation(s) still use this room. They need to be moved to another room.`;
        }
      }
      const r = await tx.room.update({ where: { id }, data: {
        number: d.number, roomTypeId: d.roomTypeId, floor: d.floor || null, maxOccupancy: d.maxOccupancy,
        amenities: d.amenities, notes: d.notes || null, ...(d.status ? { status: d.status } : {}) } });
      const parts: string[] = [];
      if (before.number !== r.number) parts.push(`renumbered from ${before.number}`);
      if (before.status !== r.status) parts.push(`status ${lbl(before.status)} → ${lbl(r.status)}`);
      if (before.roomTypeId !== r.roomTypeId) parts.push("room type changed");
      await audit(tx, actor.id, "room.update", "Room", id, `${actor.name} updated Room ${r.number}${parts.length ? ": " + parts.join(", ") : ""}`, before, r);
      return { room: r, warning };
    });
  } catch (e) { dup(e, `Room number ${d.number} already exists`); }
}