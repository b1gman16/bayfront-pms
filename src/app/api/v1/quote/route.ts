import { api } from "@/server/http";
import { prisma } from "@/server/db";
import { quote } from "@/server/services/pricing";

const ok = (s: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(+new Date(s + "T00:00:00Z"));

export const GET = api("reservation.view", async (req) => {
  const u = new URL(req.url);
  const f = u.searchParams.get("from"), t = u.searchParams.get("to"), type = u.searchParams.get("roomTypeId");
  if (!ok(f) || !ok(t) || !type) return null;
  const from = new Date(f + "T00:00:00.000Z"), to = new Date(t + "T00:00:00.000Z");
  if (to <= from || +to - +from > 366 * 864e5) return null;
  const q = await quote(prisma, type, from, to);
  return { total: q.total, bands: q.bands.map(b => ({ start: b.start.toISOString().slice(0, 10), nights: b.nights, rate: b.rate, name: b.name })) };
});