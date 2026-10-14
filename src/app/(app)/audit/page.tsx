import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
export const dynamic = "force-dynamic";

const PAGE = 50, DAY = 86_400_000;
const ok = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(+new Date(s + "T00:00:00Z"));
const shift = (s: string, n: number) => new Date(+new Date(s + "T00:00:00Z") + n * DAY).toISOString().slice(0, 10);
const input = "rounded-md border border-slate-300 px-3 py-1.5 text-sm";

export default async function AuditLog(props: { searchParams: Promise<{ from?: string; to?: string; user?: string; q?: string; page?: string }> }) {
  const sp = await props.searchParams;
  const session = (await getServerSession(authOptions))?.user as any;
  if (!can(session.role, "audit.view")) notFound();

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const to = ok(sp.to) ? sp.to! : today;
  let from = ok(sp.from) ? sp.from! : shift(to, -6);
  if (from > to) from = to;
  const q = sp.q?.trim() || undefined, userId = sp.user || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where = {
    at: { gte: new Date(from + "T00:00:00+08:00"), lt: new Date(+new Date(to + "T00:00:00+08:00") + DAY) },
    ...(userId ? { userId } : {}),
    ...(q ? { summary: { contains: q, mode: "insensitive" as const } } : {}),
  };
  const [rows, total, users] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { at: "desc" }, take: PAGE, skip: (page - 1) * PAGE }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const names = new Map(users.map(u => [u.id, u.name]));
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (p: number) => `/audit?from=${from}&to=${to}${userId ? `&user=${userId}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}&page=${p}`;

  return (<div className="space-y-4">
    <div><h1 className="text-2xl font-semibold">Audit log</h1><p className="text-sm text-slate-500">A permanent record of who did what. Entries can't be edited or deleted.</p></div>
    <form method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-sm"><span className="mb-1 block text-xs text-slate-500">From</span><input type="date" name="from" defaultValue={from} className={input} /></label>
      <label className="text-sm"><span className="mb-1 block text-xs text-slate-500">To</span><input type="date" name="to" defaultValue={to} className={input} /></label>
      <label className="text-sm"><span className="mb-1 block text-xs text-slate-500">Staff</span><select name="user" defaultValue={userId ?? ""} className={input}>
        <option value="">Everyone</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
      <label className="min-w-40 flex-1 text-sm"><span className="mb-1 block text-xs text-slate-500">Search</span><input name="q" defaultValue={q ?? ""} placeholder="e.g. BR-1003, Room 204, refund" className={`${input} w-full`} /></label>
      <button className="rounded-md bg-navy-800 px-4 py-1.5 text-sm text-white">Show</button></form>

    <p className="text-sm text-slate-500">{total.toLocaleString("en-PH")} entr{total === 1 ? "y" : "ies"} found{total > PAGE ? `, page ${page} of ${pages}` : ""}.</p>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["When", "Who", "What happened", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map(a => (<tr key={a.id} className="border-t border-slate-100 align-top">
          <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{a.at.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}</td>
          <td className="whitespace-nowrap px-4 py-2.5">{names.get(a.userId) ?? "Unknown"}</td>
          <td className="px-4 py-2.5">{a.summary}<div className="text-xs text-slate-400">{a.action}</div></td>
          <td className="px-4 py-2.5">{(a.before || a.after) && <details className="text-xs"><summary className="cursor-pointer text-brand">Details</summary>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {a.before != null && <div><div className="mb-1 font-medium text-slate-500">Before</div><pre className="max-h-48 overflow-auto rounded bg-slate-50 p-2">{JSON.stringify(a.before, null, 2)}</pre></div>}
              {a.after != null && <div><div className="mb-1 font-medium text-slate-500">After</div><pre className="max-h-48 overflow-auto rounded bg-slate-50 p-2">{JSON.stringify(a.after, null, 2)}</pre></div>}
            </div></details>}</td></tr>))}</tbody></table>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No entries match these filters.</p>}</div>
    {pages > 1 && <div className="flex items-center justify-between text-sm">
      {page > 1 ? <Link href={link(page - 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">← Newer</Link> : <span />}
      {page < pages && <Link href={link(page + 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Older →</Link>}</div>}
  </div>);
}