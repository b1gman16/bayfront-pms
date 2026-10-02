import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { formatPHP } from "../domain/folio";

const refundSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().trim().min(3).max(200),
  idempotencyKey: z.string().min(8),
});

export async function refundPayment(paymentId: string, raw: unknown, actor: Actor) {
  const d = refundSchema.parse(raw);
  const dup = await prisma.payment.findUnique({ where: { idempotencyKey: d.idempotencyKey } });
  if (dup) return dup;                                   // double-tap returns the same refund
  try {
    // Serializable: two simultaneous refunds can't both pass the "amount left" check.
    return await prisma.$transaction(async tx => {
      const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { folio: { include: { reservation: true } } } });
      if (p.kind !== "PAYMENT") throw new AppError("Only payments can be refunded");
      const done = await tx.payment.aggregate({ _sum: { amount: true }, where: { refundOfId: paymentId, kind: "REFUND" } });
      const left = p.amount - (done._sum.amount ?? 0);
      if (left <= 0) throw new AppError("This payment has already been fully refunded");
      if (d.amount > left) throw new AppError(`Only ${formatPHP(left)} of this payment can still be refunded`);
      const r = await tx.payment.create({ data: { folioId: p.folioId, amount: d.amount, kind: "REFUND", method: p.method, reference: p.reference,
        refundOfId: p.id, idempotencyKey: d.idempotencyKey, receivedById: actor.id, notes: d.reason } });
      await audit(tx, actor.id, "payment.refund", "Payment", r.id,
        `${actor.name} refunded ${formatPHP(d.amount)} (${p.method}) for ${p.folio.reservation.code}: ${d.reason}`);
      return r;
    }, { isolationLevel: "Serializable" });
  } catch (e: any) {
    if (e?.code === "P2034") throw new AppError("Another refund was processed at the same moment. Reload and try again.");
    throw e;
  }
}

const voidSchema = z.object({ reason: z.string().trim().min(3).max(200) });

export async function voidItem(itemId: string, raw: unknown, actor: Actor) {
  const d = voidSchema.parse(raw);
  return prisma.$transaction(async tx => {
    const i = await tx.folioItem.findUniqueOrThrow({ where: { id: itemId }, include: { folio: { include: { reservation: true } } } });
    if (i.folio.closedAt) throw new AppError("This folio is closed. Charges can no longer be voided.");
    const upd = await tx.folioItem.updateMany({ where: { id: itemId, voidedAt: null }, data: { voidedAt: new Date(), voidedById: actor.id, voidReason: d.reason } });
    if (upd.count === 0) throw new AppError("This charge was already voided");
    await audit(tx, actor.id, "folio.void", "FolioItem", itemId,
      `${actor.name} voided ${i.description} (${formatPHP(i.qty * i.unitAmount)}) on ${i.folio.reservation.code}: ${d.reason}`);
    return { ok: true };
  });
}