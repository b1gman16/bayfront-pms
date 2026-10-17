import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { formatPHP } from "../domain/folio";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal(""));
const schema = z.object({
  name: z.string().trim().min(2).max(60),
  roomTypeId: z.string().optional(),                       // empty = all room types
  startDate: date, endDate: date,
  days: z.array(z.number().int().min(0).max(6)).max(7).default([]),   // 0 = Sunday ... 6 = Saturday; empty = every day
  ratePesos: z.number().positive().max(1_000_000),
  priority: z.number().int().min(0).max(999).default(10),
  active: z.boolean().default(true),
}).refine(d => !d.startDate || !d.endDate || d.endDate >= d.startDate, { message: "The end date is before the start date", path: ["endDate"] });

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const day = (s?: string) => (s ? new Date(s + "T00:00:00.000Z") : null);

async function build(d: z.infer<typeof schema>) {
  let typeName = "all room types";
  if (d.roomTypeId) {
    const t = await prisma.roomType.findUnique({ where: { id: d.roomTypeId } });
    if (!t) throw new AppError("That room type doesn't exist", 400);
    typeName = t.name;
  }
  const days = [...new Set(d.days)].sort();
  const data = { name: d.name, roomTypeId: d.roomTypeId || null, startDate: day(d.startDate), endDate: day(d.endDate), days,
    rate: Math.round(d.ratePesos * 100), priority: d.priority, active: d.active };
  const when = [d.startDate || d.endDate ? `${d.startDate || "…"} to ${d.endDate || "…"}` : "", days.length ? days.map(x => DAYS[x]).join("/") : ""].filter(Boolean).join(", ") || "every night";
  return { data, text: `"${d.name}" ${formatPHP(data.rate)}/night, ${typeName}, ${when}${d.active ? "" : " (off)"}` };
}

export async function createRateRule(raw: unknown, actor: Actor) {
  const { data, text } = await build(schema.parse(raw));
  return prisma.$transaction(async tx => {
    const r = await tx.rateRule.create({ data });
    await audit(tx, actor.id, "raterule.create", "RateRule", r.id, `${actor.name} added rate ${text}`, undefined, r);
    return r;
  });
}

export async function updateRateRule(id: string, raw: unknown, actor: Actor) {
  const { data, text } = await build(schema.parse(raw));
  return prisma.$transaction(async tx => {
    const before = await tx.rateRule.findUniqueOrThrow({ where: { id } });
    const r = await tx.rateRule.update({ where: { id }, data });
    await audit(tx, actor.id, "raterule.update", "RateRule", id, `${actor.name} updated rate ${text}`, before, r);
    return r;
  });
}