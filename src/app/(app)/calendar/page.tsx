import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const VIEWS = ["day", "week", "month"] as const;
type View = (typeof VIEWS)[number];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(+d + n * DAY);
const parse = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(+new Date(s + "T00:00:00Z")) ? new Date(s + "T00:00:00.000Z") : null);
const manilaToday = () => new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");
const short = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" });

const BAR: Record<string, string> = { CHECKED_IN: "bg-navy-800 text-white", CONFIRMED: "bg-emerald-600 text-white", PENDING: "bg-amber-400 text-amber-950" };
const NAME: Record<string, string> = { CHECKED_IN: "Checked in", CONFIRMED: "Confirmed", PENDING: "Pending" };

export default async function CalendarPage(props: { searchParams: Promise<{ view?: string; date?: string }> }) {
  const sp = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "reservation.view")) notFound();

  const view: View = (VIEWS as readonly string[]).includes(sp.view ?? "") ? (sp.view as View) : "week";
  const today = manilaToday();
  const anchor = parse(sp.date) ?? today;

  let start: Date, n: number, prev: Date, next: Date, title: string;
  if (view === "month") {
    const y = anchor.getUTCFullYear(), m = anchor.getUTCMonth();
    start = new Date(Date.UTC(y, m, 1)); next = new Date(Date.UTC(y, m + 1, 1)); prev = new Date(Date.UTC(y, m - 1, 1));
    n = Math.round((+next - +start) / DAY);
    title = start.toLocaleDateString("en-PH", { month: "long", year: "numeric", timeZone: "UTC" });
  } else {
    n = view === "day" ? 1 : 7; start = anchor; prev = addDays(start, -n); next = addDays(start, n);
    title = n === 1 ? start.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
      : `${short(start)} – ${short(addDays(start, n - 1))}, ${addDays(start, n - 1).getUTCFullYear()}`;
  }
  const end = addDays(start, n);
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const href = (v: View, d: Date) => `/calendar?view=${v}&date=${iso(d)}`;

  const [types, rooms, stays] = await Promise.all([
    prisma.roomType.findMany({ orderBy: { baseRate: "asc" } }),
    prisma.room.findMany({ orderBy: { number: "asc" } }),
    prisma.reservation.findMany({
      where: { status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] }, checkIn: { lt: end }, checkOut: { gt: start } },
      include: { guest: true } }),
  ]);
  const assigned = stays.filter(s => s.roomId);
  const unassigned = stays.filter(s => !s.roomId);
  const occupied = days.map(d => assigned.filter(s => s.checkIn <= d && s.checkOut > d).length);

  const cell = n === 1 ? 360 : n <= 7 ? 96 : 40;
  const minWidth = 160 + n * cell;
  const bg = (d: Date) => (+d === +today ? "bg-sky-50" : [0, 6].includes(d.getUTCDay()) ? "bg-slate-50" : "");

  const tab = (v: View, l: string) => (
    <Link key={v} href={href(v, view === v ? anchor : anchor)} aria-current={view === v ? "page" : undefined}
      className={`rounded-md px-3 py-1.5 text-sm ${view === v ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</Link>);
  const nav = "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50";

  return (<div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold">Calendar</h1><p className="text-sm text-slate-500">{title}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">{tab("day", "Day")}{tab("week", "Week")}{tab("month", "Month")}</div>
        <Link href={href(view, prev)} className={nav} aria-label="Previous">←</Link>
        <Link href={href(view, today)} className={nav}>Today</Link>
        <Link href={href(view, next)} className={nav} aria-label="Next">→</Link></div></div>

    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
      {Object.entries(NAME).map(([k, l]) => <span key={k} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded ${BAR[k].split(" ")[0]}`} />{l}</span>)}
      <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-slate-300 bg-white" />Free</span></div>

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <div style={{ minWidth }}>
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <div className="sticky left-0 z-20 w-40 shrink-0 bg-slate-50 px-3 py-2 font-medium text-slate-500">Room</div>
          <div className="flex flex-1">{days.map(d => (
            <div key={+d} className={`flex-1 border-l border-slate-200 py-2 text-center ${bg(d)} ${+d === +today ? "font-semibold text-brand" : "text-slate-500"}`}>
              {n === 1 ? d.toLocaleDateString("en-PH", { weekday: "long", timeZone: "UTC" }) : <>{d.toLocaleDateString("en-PH", { weekday: "short", timeZone: "UTC" }).slice(0, n > 7 ? 1 : 3)}<br />{d.getUTCDate()}</>}
            </div>))}</div></div>

        <div className="flex border-b border-slate-200 text-xs">
          <div className="sticky left-0 z-10 w-40 shrink-0 bg-white px-3 py-1.5 font-medium text-slate-500">Occupied</div>
          <div className="flex flex-1">{occupied.map((o, i) => <div key={i} className={`flex-1 border-l border-slate-100 py-1.5 text-center ${bg(days[i])} ${o >= rooms.length && rooms.length > 0 ? "font-semibold text-red-600" : "text-slate-600"}`}>{o}/{rooms.length}</div>)}</div></div>

        {types.map(t => {
          const list = rooms.filter(r => r.roomTypeId === t.id);
          if (list.length === 0) return null;
          return (<div key={t.id}>
            <div className="sticky left-0 border-b border-slate-100 bg-slate-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.name}</div>
            {list.map(room => (
              <div key={room.id} className="flex border-b border-slate-100">
                <div className="sticky left-0 z-10 w-40 shrink-0 bg-white px-3 py-2 text-sm font-medium">Room {room.number}
                  {["MAINTENANCE", "OUT_OF_ORDER"].includes(room.status) && <span className="ml-2 rounded bg-red-50 px-1.5 text-[11px] font-normal text-red-700">{room.status === "MAINTENANCE" ? "Maintenance" : "Out of order"}</span>}</div>
                <div className="relative h-11 flex-1">
                  <div className="absolute inset-0 flex">{days.map(d => <div key={+d} className={`flex-1 border-l border-slate-100 ${bg(d)}`} />)}</div>
                  {assigned.filter(s => s.roomId === room.id).map(s => {
                    const l = Math.max((+s.checkIn - +start) / DAY + 0.5, 0), r = Math.min((+s.checkOut - +start) / DAY + 0.5, n);
                    if (r <= l) return null;
                    const label = `${s.guest.fullName} · ${s.code} · ${short(s.checkIn)} to ${short(s.checkOut)} · ${NAME[s.status]}`;
                    return (<Link key={s.id} href={`/reservations/${s.id}`} title={label} aria-label={label}
                      className={`absolute bottom-1.5 top-1.5 truncate rounded px-2 text-xs leading-7 shadow-sm hover:brightness-110 ${BAR[s.status]}`}
                      style={{ left: `${(l / n) * 100}%`, width: `calc(${((r - l) / n) * 100}% - 2px)` }}>{s.guest.fullName}</Link>);
                  })}</div></div>))}</div>);
        })}
        {rooms.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No rooms set up yet. Add rooms on the Rooms page.</p>}
      </div></div>

    {unassigned.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h2 className="mb-2 text-sm font-semibold text-amber-900">Reservations without a room ({unassigned.length})</h2>
      <ul className="space-y-1 text-sm">{unassigned.map(s => <li key={s.id}><Link href={`/reservations/${s.id}`} className="text-brand hover:underline">{s.guest.fullName}</Link>
        <span className="text-slate-600"> · {s.code} · {short(s.checkIn)} to {short(s.checkOut)}</span></li>)}</ul></section>}
  </div>);
}