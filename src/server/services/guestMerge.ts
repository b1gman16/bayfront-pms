import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";

const schema = z.object({ keepId: z.string().min(1), removeId: z.string().min(1) });

/** Merge one guest profile into another. Reservations (and so bills and payments) move across; then the extra profile is removed. */
export async function mergeGuests(raw: unknown, actor: Actor) {
  const { keepId, removeId } = schema.parse(raw);
  if (keepId === removeId) throw new AppError("Choose two different profiles", 400);
  try {
    return await prisma.$transaction(async tx => {
      const keep = await tx.guest.findUniqueOrThrow({ where: { id: keepId } });
      const rem = await tx.guest.findUniqueOrThrow({ where: { id: removeId } });
      const moved = await tx.reservation.findMany({ where: { guestId: removeId }, select: { code: true } });
      await tx.reservation.updateMany({ where: { guestId: removeId }, data: { guestId: keepId } });

      // Blank details on the kept profile are filled from the removed one. The kept profile's own details are never overwritten.
      const fill: Prisma.GuestUpdateInput = {};
      if (!keep.phone && rem.phone) fill.phone = rem.phone;
      if (!keep.email && rem.email) fill.email = rem.email;
      if (!keep.address && rem.address) fill.address = rem.address;
      if (!keep.nationality && rem.nationality) fill.nationality = rem.nationality;
      if (!keep.idNumberEnc && rem.idNumberEnc) { fill.idNumberEnc = rem.idNumberEnc; fill.idType = rem.idType; }
      if (rem.notes) fill.notes = [keep.notes, `[From merged profile ${rem.fullName}] ${rem.notes}`].filter(Boolean).join("\n").slice(0, 1000);
      if (Object.keys(fill).length) await tx.guest.update({ where: { id: keepId }, data: fill });

      await tx.guest.delete({ where: { id: removeId } });
      await audit(tx, actor.id, "guest.merge", "Guest", keepId,
        `${actor.name} merged ${rem.fullName} into ${keep.fullName}: ${moved.length} reservation(s) moved${moved.length ? " (" + moved.map(m => m.code).join(", ") + ")" : ""}`,
        // The removed profile's details are kept in the log, but never its ID number.
        { removed: { id: rem.id, fullName: rem.fullName, phone: rem.phone, email: rem.email, address: rem.address, nationality: rem.nationality,
            notes: rem.notes, idType: rem.idType, createdAt: rem.createdAt }, reservations: moved.map(m => m.code) },
        { keptId: keepId });
      return { keepId, moved: moved.length };
    });
  } catch (e: any) {
    if (e?.code === "P2025") throw new AppError("One of those profiles no longer exists. Reload the page.");
    if (e?.code === "P2003") throw new AppError("A reservation was just added to the profile being removed. Try the merge again.");
    throw e;
  }
}