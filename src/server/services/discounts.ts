import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { formatPHP } from "../domain/folio";

const schema = z.object({
  mode: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive().max(1_000_000),
  reason: z.string().trim().min(3).max(120),
}).refine(d => d.mode !== "PERCENT" || d.value <= 100, { message: "A percentage can't be more than 100", path: ["value"] });

const manilaToday = () => new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");

/** A discount is a negative line on the bill. Fees and taxes are worked out after it. */
export async function addDiscount(folioId: string, raw: unknown, actor: Actor) {
  const d = schema.parse(raw);
  return prisma.$transaction(async tx => {
    const f = await tx.folio.findUniqueOrThrow({ where: { id: folioId }, include: { items: true, reservation: true } });
    if (f.closedAt || f.reservation.status !== "CHECKED_IN") throw new AppError("Discounts can only be added to the bill of a guest who is checked in");
    const subtotal = f.items.filter(i => !i.voidedAt).reduce((s, i) => s + i.qty * i.unitAmount, 0);
    const amount = d.mode === "PERCENT" ? Math.round((subtotal * d.value) / 100) : Math.round(d.value * 100);
    if (amount <= 0) throw new AppError("That works out to no discount", 400);
    if (amount > subtotal) throw new AppError(`The discount can't be more than the bill's charges (${formatPHP(subtotal)})`, 400);
    const item = await tx.folioItem.create({ data: { folioId, category: "DISCOUNT", description: `Discount: ${d.reason}`, qty: 1, unitAmount: -amount, businessDate: manilaToday(), postedById: actor.id } });
    await audit(tx, actor.id, "folio.discount", "FolioItem", item.id,
      `${actor.name} gave a ${formatPHP(amount)} discount${d.mode === "PERCENT" ? ` (${d.value}%)` : ""} on ${f.reservation.code}: ${d.reason}`);
    return { id: item.id, amount };
  });
}