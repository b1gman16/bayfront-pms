import { prisma } from "@/server/db";
import { formatPHP } from "@/server/domain/folio";
import { CalendarDays, UserCheck, LogOut, BedDouble, CheckCircle2, Wallet, ArrowLeftRight, Wrench, AlertCircle } from "lucide-react";
export const dynamic = "force-dynamic";

const fmtTime = (d: Date) => d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

export default async function Dashboard() {
  const now = new Date();
  const today = new Date(now.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");
  const [arrivals, departures, rooms, active, inHouse, outToday, activity] = await Promise.all([
    prisma.reservation.findMany({ where: { checkIn: today, status: { in: ["PENDING", "CONFIRMED"] } }, include: { guest: true, room: true }, take: 6 }),
    prisma.reservation.findMany({ where: { checkOut: today, status: "CHECKED_IN" }, include: { guest: true, room: true }, take: 6 }),
    prisma.room.groupBy({ by: ["status"], _count: true }),
    prisma.reservation.count({ where: { status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] }, checkIn: { lte: today }, checkOut: { gt: today } } }),
    prisma.room.count({ where: { status: "OCCUPIED" } }),
    prisma.reservation.count({ where: { status: "CHECKED_OUT", checkedOutAt: { gte: today } } }),
    prisma.auditLog.findMany({ orderBy: { at: "desc" }, take: 5 }),
  ]);
  const n = (...s: string[]) => rooms.filter(r => s.includes(r.status)).reduce((a, r) => a + r._count, 0);
  const total = rooms.reduce((a, r) => a + r._count, 0);
  const segs = [["Occupied", n("OCCUPIED"), "#0d2540"], ["Available", n("AVAILABLE", "CLEAN", "INSPECTED", "RESERVED"), "#3a9d4a"],
    ["Needs cleaning", n("DIRTY", "CLEANING"), "#f59e0b"], ["Maintenance / Out of order", n("MAINTENANCE", "OUT_OF_ORDER"), "#dc2626"]] as const;
  let acc = 0;
  const stops = segs.map(([, v, c]) => { const a = acc; acc += total ? (v / total) * 100 : 0; return `${c} ${a}% ${acc}%`; }).join(",");
  const occ = total ? Math.round((inHouse / total) * 100) : 0;
  const stats = [
    { l: "Active reservations", v: active, sub: "Staying or arriving today", Icon: CalendarDays, c: "bg-blue-50 text-blue-600" },
    { l: "Checked in", v: inHouse, sub: `${occ}% occupancy`, Icon: UserCheck, c: "bg-emerald-50 text-emerald-600" },
    { l: "Checked out", v: outToday, sub: "Today", Icon: LogOut, c: "bg-violet-50 text-violet-600" },
    { l: "Available rooms", v: segs[1][1], sub: `of ${total} rooms`, Icon: BedDouble, c: "bg-sky-50 text-sky-600" }];
  const icon = (a: string) => a.startsWith("checkin") ? <CheckCircle2 className="text-emerald-600" /> : a.startsWith("payment") ? <Wallet className="text-blue-600" />
    : a.startsWith("checkout") ? <ArrowLeftRight className="text-violet-600" /> : a.startsWith("maint") ? <Wrench className="text-red-600" /> : <AlertCircle className="text-slate-500" />;
  const Table = ({ title, rows, empty }: { title: string; rows: typeof arrivals; empty: string }) => (
    <section className={card}><h2 className="mb-3 font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">{empty}</p> :
        <table className="w-full text-sm"><thead className="text-left text-xs text-slate-500"><tr><th className="pb-2 font-medium">Guest</th><th className="pb-2 font-medium">Room</th><th className="pb-2 font-medium">Code</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id} className="border-t border-slate-100"><td className="py-2.5">{r.guest.fullName}</td>
            <td>{r.room ? r.room.number : <span className="text-amber-600">Unassigned</span>}</td><td className="text-slate-500">{r.code}</td></tr>)}</tbody></table>}
    </section>);
  return (<div className="space-y-5">
    <div><h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-slate-500">{now.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })}</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s => (
      <div key={s.l} className={`${card} flex items-center gap-4`}><div className={`rounded-xl p-3 ${s.c}`}><s.Icon size={22} /></div>
        <div><div className="text-sm text-slate-500">{s.l}</div><div className="text-3xl font-semibold leading-tight">{s.v}</div><div className="text-xs text-emerald-600">{s.sub}</div></div></div>))}</div>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={card}><h2 className="mb-4 font-semibold">Room status</h2>
        <div className="flex items-center gap-6">
          <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${stops})` : "#e2e8f0" }} role="img" aria-label={`${total} rooms`}>
            <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-semibold">{total}</span><span className="text-[11px] text-slate-500">Total rooms</span></div></div>
          <ul className="space-y-2 text-sm">{segs.map(([l, v, c]) => <li key={l} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{l}<b className="ml-auto pl-3">{v}</b></li>)}</ul></div></section>
      <Table title="Today's arrivals" rows={arrivals} empty="No arrivals expected today" />
      <Table title="Today's departures" rows={departures} empty="No departures due today" />
    </div>
    <div className="grid gap-4 lg:grid-cols-5">
      <section className={`${card} lg:col-span-3`}><h2 className="mb-3 font-semibold">Recent activity</h2>
        {activity.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Activity will appear here as staff use the system.</p> :
          <ul>{activity.map(a => <li key={a.id} className="flex items-center gap-3 border-t border-slate-100 py-2.5 text-sm first:border-0">
            <span className="[&>svg]:h-5 [&>svg]:w-5">{icon(a.action)}</span><span className="flex-1">{a.summary}</span><span className="text-xs text-slate-400">{fmtTime(a.at)}</span></li>)}</ul>}</section>
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-navy-900 via-[#14566b] to-[#e08a4b] p-6 text-white lg:col-span-2">
        <div className="font-logo text-2xl">Welcome to<br />Bayfront Resort</div><p className="mt-2 text-sm text-white/80">Your perfect getaway awaits.</p>
        <div className="mt-6 text-xs text-white/70">Collected today: {formatPHP(0)}</div></section>
    </div></div>);
}