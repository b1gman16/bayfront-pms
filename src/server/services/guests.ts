import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { encrypt } from "../crypto";
import { normPhone } from "../domain/duplicates";

const opt = (max: number) => z.string().trim().max(max).optional();
const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: opt(30), email: z.string().trim().email().optional().or(z.literal("")),
  address: opt(200), nationality: opt(50), notes: opt(1000),
  idType: opt(40), idNumber: opt(40), clearId: z.boolean().default(false),
});

export async function updateGuest(id: string, raw: unknown, actor: Actor) {
  const d = schema.parse(raw);
  return prisma.$transaction(async tx => {
    const g = await tx.guest.findUniqueOrThrow({ where: { id } });
    if (d.phone) {
      const key = normPhone(d.phone);
      const ex = key ? (await tx.guest.findMany({ where: { phone: { not: null }, id: { not: id } }, select: { fullName: true, phone: true } })).find(g => normPhone(g.phone) === key) : undefined;
      if (ex) throw new AppError(`Another guest already uses this phone number: ${ex.fullName}.`);
    }
    let idNumberEnc = g.idNumberEnc;
    let idType = d.clearId ? null : d.idType || g.idType;
    if (d.clearId) idNumberEnc = null;
    else if (d.idNumber) {
      try { idNumberEnc = encrypt(d.idNumber); }
      catch { throw new AppError("ID encryption isn't set up correctly. Check ID_ENCRYPTION_KEY in the .env file.", 500); }
    }
    const next = { fullName: d.fullName, phone: d.phone || null, email: d.email || null, address: d.address || null,
      nationality: d.nationality || null, notes: d.notes || null };
    await tx.guest.update({ where: { id }, data: { ...next, idType, idNumberEnc } });

    const names: Record<string, string> = { fullName: "name", phone: "phone", email: "email", address: "address", nationality: "nationality", notes: "notes" };
    const changed = (Object.keys(next) as (keyof typeof next)[]).filter(k => (g[k] ?? null) !== next[k]).map(k => names[k]);
    if (idType !== g.idType || idNumberEnc !== g.idNumberEnc) changed.push("ID details");
    await audit(tx, actor.id, "guest.update", "Guest", id,
      `${actor.name} updated guest ${d.fullName}${changed.length ? ": " + changed.join(", ") : " (no changes)"}`);   // ID numbers are never logged
    return { ok: true };
  });
}