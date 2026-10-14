import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { REPORTS, runReport, resolveRange, Cell, ColType } from "@/server/services/reports";
import { PrintReportButton } from "@/components/ReportActions";
export const dynamic = "force-dynamic";

const show = (v: Cell, t?: ColType) => v === null ? "—" : typeof v === "number" ? (t === "money" ? formatPHP(v) : t === "pct" ? `${v.toFixed(1)}%` : v.toLocaleString("en-PH")) : v;
const shift = (s: string, n: number) => new Date(+new Date(s + "T00:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const nice = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const input = "rounded-md border border-slate-300 px-3 py-1.5 text-sm";

export default async function ReportPage(props: { params: Promise<{ type: string }>; searchParams: Promise<{ from?: string; to?: string }> }) {
  const { type } = await props.params; const sp = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  const def = REPORTS.find(r => r.key === type);
  if (!def || !can(user.role, def.perm)) notFound();

  const { from, to } = resolveRange(sp.from, sp.to, def.single);
  const rep = await runReport(def.key, from, to);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const monthStart = today.slice(0, 8) + "01", lastEnd = shift(monthStart, -1);
  const quick: [string, string, string][] = def.single
    ? [["Today", today, today], ["Yesterday", shift(today, -1), shift(today, -1)]]
    : [["Today", today, today], ["Yesterday", shift(today, -1), shift(today, -1)], ["Last 7 days", shift(today, -6), today], ["This month", monthStart, today], ["Last month", lastEnd.slice(0, 8) + "01", lastEnd]];
  const csv = `/api/v1/reports/${def.key}?from=${from}&to=${to}&format=csv`;
  const period = def.noDates ? "As of now" : def.single ? nice(from) : from === to ? nice(from) : `${nice(from)} to ${nice(to)}`;

  return (<div className="space-y-5">
    <style>{`@media print { aside, header, .no-print { display: none !important; } [class~="md:pl-60"] { padding-left: 0 !important; } body { background: #fff !important; } }`}</style>
    <div className="hidden print:block"><div className="font-logo text-xl tracking-widest">BAYFRONT RESORT</div></div>
    <div className="no-print"><Link href="/reports" className="text-sm text-brand">← All reports</Link></div>
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">{rep.title}</h1><p className="text-sm text-slate-500">{period}</p></div>
      <div className="no-print flex gap-2"><a href={csv} className="rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white">Export CSV</a><PrintReportButton /></div></div>

    {!def.noDates && <div className="no-print space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="text-sm"><span className="mb-1 block text-xs text-slate-500">{def.single ? "Date" : "From"}</span><input type="date" name="from" defaultValue={from} className={input} /></label>
        {!def.single && <label className="text-sm"><span className="mb-1 block text-xs text-slate-500">To</span><input type="date" name="to" defaultValue={to} className={input} /></label>}
        <button className="rounded-md bg-navy-800 px-4 py-1.5 text-sm text-white">Show</button></form>
      <div className="flex flex-wrap gap-2 text-sm">{quick.map(([l, f, t]) => <Link key={l} href={`/reports/${def.key}?from=${f}&to=${t}`} className="rounded-full bg-slate-100 px-3 py-1 hover:bg-slate-200">{l}</Link>)}</div></div>}

    {rep.summary.length > 0 && <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{rep.summary.map(s => (
      <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{s.label}</div><div className="mt-1 text-xl font-semibold">{show(s.value, s.type)}</div></div>))}</div>}
    {rep.note && <p className="text-sm text-slate-500">{rep.note}</p>}

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {rep.columns.map(c => <th key={c.label} className={`px-4 py-3 font-medium ${c.type && c.type !== "text" ? "text-right" : ""}`}>{c.label}</th>)}</tr></thead>
        <tbody>{rep.rows.map((r, i) => <tr key={i} className="border-t border-slate-100">
          {r.map((v, j) => <td key={j} className={`px-4 py-2.5 ${rep.columns[j].type && rep.columns[j].type !== "text" ? "text-right tabular-nums" : ""}`}>{show(v, rep.columns[j].type)}</td>)}</tr>)}</tbody>
        {rep.footer && rep.rows.length > 0 && <tfoot><tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
          {rep.footer.map((v, j) => <td key={j} className={`px-4 py-2.5 ${rep.columns[j].type && rep.columns[j].type !== "text" ? "text-right tabular-nums" : ""}`}>{show(v, rep.columns[j].type)}</td>)}</tr></tfoot>}</table>
      {rep.rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Nothing to show for this period.</p>}</div>
    <p className="hidden text-xs text-slate-400 print:block">Printed {new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</p></div>);
}