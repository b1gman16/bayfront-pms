import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { computeFolio, formatPHP } from "../domain/folio";
import { nightsBetween } from "../domain/availability";

const schema = z.object({
  amount: z.number().int().positive(),
  method: z.string().min(1),
  reference: z.string().trim().max(60).optional(),
  idempotencyKey: z.string().min(8),
});

/** Record a payment before check-in. The bill (folio) is created here if it doesn't exist yet. */
export async function recordDeposit(reservationId: string, raw: unknown, actor: Actor) {
  const d = schema.parse(raw);
  const existing = () => prisma.payment.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  const dup = await existing();
  if (dup) return dup;                                   // double-tap or retry returns the same deposit
  try {
    return await prisma.$transaction(async tx => {
      const r = await tx.reservation.findUniqueOrThrow({ where: { id: reservationId }, include: { folio: { include: { payments: true } } } });
      if (!["PENDING", "CONFIRMED"].includes(r.status))
        throw new AppError("Deposits can only be recorded before check-in. For guests in the house, use their bill page.");
      const live = await tx.feeRule.findMany();
      const estimate = computeFolio([{ qty: nightsBetween(r.checkIn, r.checkOut), unitAmount: r.ratePerNight }], live, []).total;
      const held = (r.folio?.payments ?? []).reduce((s, p) => s + (p.kind === "PAYMENT" ? p.amount : -p.amount), 0);
      if (held + d.amount > estimate)
        throw new AppError(`That would bring the deposits to ${formatPHP(held + d.amount)}, more than the estimated room bill of ${formatPHP(estimate)}.`, 400);
      const folio = await tx.folio.upsert({ where: { reservationId }, create: { reservationId }, update: {} });
      const p = await tx.payment.create({ data: { folioId: folio.id, amount: d.amount, method: d.method, reference: d.reference || null,
        idempotencyKey: d.idempotencyKey, receivedById: actor.id, notes: "Deposit" } });
      await audit(tx, actor.id, "payment.record", "Payment", p.id,
        `${actor.name} recorded ${formatPHP(d.amount)} ${d.method.replace("_", " ")} deposit for ${r.code}`);
      return p;
    });
  } catch (e: any) {
    if (e?.code === "P2002") { const again = await existing(); if (again) return again; }   // two taps at the same moment
    throw e;
  }
}