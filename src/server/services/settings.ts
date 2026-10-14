import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { Actor } from "../http";
import { formatPHP } from "../domain/folio";

const KIND: Record<string, string> = { TAX: "tax", FEE: "fee", DISCOUNT: "discount" };
const describe = (type: string, value: number) => (type === "PERCENT" ? `${value / 100}%` : `${formatPHP(value)} per bill`);

const ruleSchema = z.object({
  name: z.string().trim().min(2).max(60),
  kind: z.enum(["TAX", "FEE", "DISCOUNT"]),
  type: z.enum(["PERCENT", "FIXED"]),
  amount: z.number().positive().max(1_000_000),          // a percentage (12 = 12%) or an amount in pesos
  compound: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(999).default(0),
}).refine(d => d.type !== "PERCENT" || d.amount <= 100, { message: "A percentage can't be more than 100", path: ["amount"] });

// Stored as whole numbers: percentages in basis points (12% = 1200), fixed amounts in centavos.
const toValue = (amount: number) => Math.round(amount * 100);

export async function createRule(raw: unknown, actor: Actor) {
  const d = ruleSchema.parse(raw);
  const value = toValue(d.amount);
  return prisma.$transaction(async tx => {
    const r = await tx.feeRule.create({ data: { name: d.name, kind: d.kind, type: d.type, value, compound: d.kind === "TAX" && d.compound, active: d.active, sortOrder: d.sortOrder } });
    await audit(tx, actor.id, "feerule.create", "FeeRule", r.id,
      `${actor.name} added ${KIND[d.kind]} "${d.name}" (${describe(d.type, value)})${d.active ? "" : ", turned off"}`, undefined, r);
    return r;
  });
}

export async function updateRule(id: string, raw: unknown, actor: Actor) {
  const d = ruleSchema.parse(raw);
  const value = toValue(d.amount);
  return prisma.$transaction(async tx => {
    const b = await tx.feeRule.findUniqueOrThrow({ where: { id } });
    const r = await tx.feeRule.update({ where: { id }, data: { name: d.name, kind: d.kind, type: d.type, value, compound: d.kind === "TAX" && d.compound, active: d.active, sortOrder: d.sortOrder } });
    const parts: string[] = [];
    if (b.name !== r.name) parts.push(`renamed from "${b.name}"`);
    if (b.type !== r.type || b.value !== r.value) parts.push(`${describe(b.type, b.value)} → ${describe(r.type, r.value)}`);
    if (b.active !== r.active) parts.push(r.active ? "turned on" : "turned off");
    if (b.compound !== r.compound) parts.push(r.compound ? "now applies on top of fees" : "no longer applies on top of fees");
    if (b.sortOrder !== r.sortOrder) parts.push("order changed");
    await audit(tx, actor.id, "feerule.update", "FeeRule", id,
      `${actor.name} updated ${KIND[r.kind]} "${r.name}"${parts.length ? ": " + parts.join(", ") : " (no changes)"}`, b, r);
    return r;
  });
}

export type Resort = { name: string; address: string; phone: string; tin: string; footer: string };
export const RESORT_DEFAULT: Resort = { name: "Bayfront Resort", address: "", phone: "", tin: "", footer: "" };

export async function getResort(): Promise<Resort> {
  const s = await prisma.setting.findUnique({ where: { key: "resort" } });
  return { ...RESORT_DEFAULT, ...((s?.value as Partial<Resort> | null) ?? {}) };
}

const resortSchema = z.object({
  name: z.string().trim().min(2).max(80),
  address: z.string().trim().max(200).optional(), phone: z.string().trim().max(40).optional(),
  tin: z.string().trim().max(60).optional(), footer: z.string().trim().max(200).optional(),
});

export async function saveResort(raw: unknown, actor: Actor) {
  const d = resortSchema.parse(raw);
  const value = { name: d.name, address: d.address ?? "", phone: d.phone ?? "", tin: d.tin ?? "", footer: d.footer ?? "" };
  return prisma.$transaction(async tx => {
    const before = await tx.setting.findUnique({ where: { key: "resort" } });
    await tx.setting.upsert({ where: { key: "resort" }, create: { key: "resort", value }, update: { value } });
    await audit(tx, actor.id, "setting.update", "Setting", "resort", `${actor.name} updated the resort and receipt details`, before?.value, value);
    return { ok: true };
  });
}