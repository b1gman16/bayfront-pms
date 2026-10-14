import { api, AppError } from "@/server/http";
import { can } from "@/server/domain/permissions";
import { REPORTS, runReport, resolveRange, toCsv } from "@/server/services/reports";

export const GET = api("", async (req, actor, { params }) => {
  const def = REPORTS.find(r => r.key === params.type);
  if (!def) throw new AppError("Unknown report", 404);
  if (!can(actor.role, def.perm)) throw new AppError("Not allowed", 403);
  const u = new URL(req.url);
  const { from, to } = resolveRange(u.searchParams.get("from"), u.searchParams.get("to"), def.single);
  const report = await runReport(def.key, from, to);
  if (u.searchParams.get("format") !== "csv") return report;
  return new Response("\uFEFF" + toCsv(report), {   // BOM so Excel reads the file as UTF-8
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bayfront-${def.key}-${from}_to_${to}.csv"` },
  });
});