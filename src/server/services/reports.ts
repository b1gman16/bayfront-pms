import { prisma } from "../db";
import { computeFolio, rulesForFolio } from "../domain/folio";
import { nightsBetween } from "../domain/availability";

export type Cell = string | number | null;
export type ColType = "text" | "money" | "num" | "pct";   // money = centavos, pct = 0 to 100
export type Report = {
  title: string; note?: string;
  summary: { label: string; value: Cell; type?: ColType }[];
  columns: { label: string; type?: ColType }[];
  rows: Cell[][]; footer?: Cell[];
};
export type ReportDef = { key: string; title: string; group: string; perm: "report.view" | "report.financial"; desc: string; single?: boolean; noDates?: boolean };

export const REPORTS: ReportDef[] = [
  { key: "daily", title: "Daily operations", group: "Daily operations", perm: "report.view", single: true, desc: "Arrivals, departures, in-house guests and occupancy for one day." },
  { key: "collections", title: "Collections by payment method", group: "Financial", perm: "report.financial", desc: "Payments received and refunded, by day and method." },
  { key: "revenue", title: "Charges by room type", group: "Financial", perm: "report.financial", desc: "Room and other charges posted, grouped by room type." },
  { key: "outstanding", title: "Outstanding balances", group: "Financial", perm: "report.financial", noDates: true, desc: "Bills with money still owed. Always shows the current position." },
  { key: "adjustments", title: "Refunds and voided charges", group: "Financial", perm: "report.financial", desc: "Every refund and voided charge, with the reason and who did it." },
  { key: "reservations", title: "Reservations", group: "Reservations", perm: "report.view", desc: "Reservations arriving in the period, with cancellation and no-show rates." },
  { key: "sources", title: "Booking sources", group: "Reservations", perm: "report.view", desc: "Where bookings came from, for reservations made in the period." },
  { key: "housekeeping", title: "Housekeeping tasks", group: "Housekeeping and maintenance", perm: "report.view", desc: "Cleaning tasks, how long they took, and current room status." },
  { key: "maintenance", title: "Maintenance tickets", group: "Housekeeping and maintenance", perm: "report.view", desc: "Problems reported in the period and how fast they were fixed." },
];

const DAY = 86_400_000;
const dayUTC = (s: string) => new Date(s + "T00:00:00.000Z");
const iso = (d: Date) => d.toISOString().slice(0, 10);
const manilaDate = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
const manilaStart = (s: string) => new Date(s + "T00:00:00+08:00");
const shortDate = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const when = (d?: Date | null) => (d ? d.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "—");
const label = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

export function resolveRange(from?: string | null, to?: string | null, single = false) {
  const ok = (s?: string | null) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(+dayUTC(s));
  const today = manilaDate(new Date());
  if (single) { const d = ok(from) ? from! : today; return { from: d, to: d }; }
  const t = ok(to) ? to! : today;
  let f = ok(from) ? from! : iso(new Date(+dayUTC(t) - 6 * DAY));
  if (f > t) f = t;
  if ((+dayUTC(t) - +dayUTC(f)) / DAY > 365) f = iso(new Date(+dayUTC(t) - 365 * DAY));
  return { from: f, to: t };
}

type Ctx = { from: string; to: string; dFrom: Date; dTo: Date; tFrom: Date; tTo: Date; who: (id?: string | null) => string };
const folioInclude = { folio: { include: { reservation: { include: { guest: true } } } } } as const;

const R: Record<string, (c: Ctx) => Promise<Report>> = {
  async daily({ dFrom }) {
    const ACTIVE = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] as const;
    const inc = { guest: true, room: true } as const;
    const [arr, dep, stay, roomCount] = await Promise.all([
      prisma.reservation.findMany({ where: { checkIn: dFrom, status: { in: [...ACTIVE] } }, include: inc, orderBy: { code: "asc" } }),
      prisma.reservation.findMany({ where: { checkOut: dFrom, status: { in: ["CHECKED_IN", "CHECKED_OUT"] } }, include: inc, orderBy: { code: "asc" } }),
      prisma.reservation.findMany({ where: { checkIn: { lte: dFrom }, checkOut: { gt: dFrom }, status: { in: [...ACTIVE] } }, include: inc, orderBy: { code: "asc" } }),
      prisma.room.count(),
    ]);
    const inHouse = stay.filter(r => r.status === "CHECKED_IN" || r.status === "CHECKED_OUT");
    const occupiedRooms = new Set(inHouse.map(r => r.roomId)).size;
    const row = (t: string, r: (typeof arr)[number]): Cell[] => [t, r.guest.fullName, r.room?.number ?? "Unassigned", r.code, label(r.status)];
    return {
      title: `Daily operations, ${shortDate(dFrom)}`,
      note: "Occupancy counts rooms with a guest staying that night. Reserved means booked for that night but not yet checked in.",
      summary: [{ label: "Arrivals", value: arr.length }, { label: "Departures", value: dep.length }, { label: "Guests in house", value: inHouse.length },
        { label: "Reserved, not yet arrived", value: stay.length - inHouse.length }, { label: "Total rooms", value: roomCount },
        { label: "Occupancy", value: roomCount ? Math.round((occupiedRooms / roomCount) * 1000) / 10 : 0, type: "pct" }],
      columns: [{ label: "List" }, { label: "Guest" }, { label: "Room" }, { label: "Reservation" }, { label: "Status" }],
      rows: [...arr.map(r => row("Arrival", r)), ...dep.map(r => row("Departure", r)), ...inHouse.map(r => row("In house", r))],
    };
  },

  async collections({ tFrom, tTo }) {
    const pays = await prisma.payment.findMany({ where: { at: { gte: tFrom, lt: tTo } }, orderBy: { at: "asc" } });
    const m = new Map<string, { date: string; method: string; n: number; paid: number; ref: number }>();
    for (const p of pays) {
      const date = manilaDate(p.at), k = `${date}|${p.method}`;
      const e = m.get(k) ?? { date, method: p.method, n: 0, paid: 0, ref: 0 };
      e.n++; if (p.kind === "REFUND") e.ref += p.amount; else e.paid += p.amount; m.set(k, e);
    }
    const list = [...m.values()].sort((a, b) => a.date.localeCompare(b.date) || a.method.localeCompare(b.method));
    const paid = sum(list.map(e => e.paid)), ref = sum(list.map(e => e.ref));
    return {
      title: "Collections by payment method", note: "Cash actually received and refunded in the period. Refunds are recorded here but the money must be returned by hand.",
      summary: [{ label: "Received", value: paid, type: "money" }, { label: "Refunded", value: ref, type: "money" }, { label: "Net collected", value: paid - ref, type: "money" }],
      columns: [{ label: "Date" }, { label: "Method" }, { label: "Transactions", type: "num" }, { label: "Received", type: "money" }, { label: "Refunded", type: "money" }, { label: "Net", type: "money" }],
      rows: list.map(e => [shortDate(dayUTC(e.date)), label(e.method), e.n, e.paid, e.ref, e.paid - e.ref]),
      footer: ["Total", "", sum(list.map(e => e.n)), paid, ref, paid - ref],
    };
  },

  async revenue({ dFrom, dTo }) {
    const items = await prisma.folioItem.findMany({ where: { voidedAt: null, businessDate: { gte: dFrom, lte: dTo } },
      include: { folio: { include: { reservation: { include: { roomType: true } } } } } });
    const m = new Map<string, { room: number; other: number }>();
    for (const i of items) {
      const n = i.folio.reservation.roomType.name, e = m.get(n) ?? { room: 0, other: 0 }, a = i.qty * i.unitAmount;
      if (i.category === "ROOM") e.room += a; else e.other += a; m.set(n, e);
    }
    const list = [...m].sort((a, b) => b[1].room + b[1].other - (a[1].room + a[1].other));
    const room = sum(list.map(([, e]) => e.room)), other = sum(list.map(([, e]) => e.other));
    return {
      title: "Charges by room type",
      note: "Before taxes and service fees. A stay's room charge is counted on its check-in date; other charges on the day they were added. Voided charges are excluded.",
      summary: [{ label: "Room charges", value: room, type: "money" }, { label: "Other charges", value: other, type: "money" }, { label: "Total charges", value: room + other, type: "money" }],
      columns: [{ label: "Room type" }, { label: "Room charges", type: "money" }, { label: "Other charges", type: "money" }, { label: "Total", type: "money" }],
      rows: list.map(([n, e]) => [n, e.room, e.other, e.room + e.other]), footer: ["Total", room, other, room + other],
    };
  },

  async outstanding() {
    const [folios, rules] = await Promise.all([
      prisma.folio.findMany({ where: { reservation: { status: { in: ["CHECKED_IN", "CHECKED_OUT"] } } }, include: { items: true, payments: true, reservation: { include: { guest: true, room: true } } } }),
      prisma.feeRule.findMany(),
    ]);
    const list = folios.map(f => ({ f, t: computeFolio(f.items.map(i => ({ qty: i.qty, unitAmount: i.unitAmount, voided: !!i.voidedAt })), rulesForFolio(f.rulesSnapshot, rules), f.payments) }))
      .filter(x => x.t.balance > 0).sort((a, b) => b.t.balance - a.t.balance);
    const total = sum(list.map(x => x.t.balance));
    return {
      title: "Outstanding balances", note: "Current position, not tied to dates. Checked-out guests listed here left with a balance released by a manager.",
      summary: [{ label: "Bills with a balance", value: list.length }, { label: "Total outstanding", value: total, type: "money" }],
      columns: [{ label: "Reservation" }, { label: "Guest" }, { label: "Room" }, { label: "Stay" }, { label: "Total bill", type: "money" }, { label: "Paid", type: "money" }, { label: "Balance", type: "money" }],
      rows: list.map(({ f, t }) => [f.reservation.code, f.reservation.guest.fullName, f.reservation.room?.number ?? "-", f.reservation.status === "CHECKED_IN" ? "In house" : "Checked out", t.total, t.paid - t.refunded, t.balance]),
      footer: ["Total", "", "", "", sum(list.map(x => x.t.total)), sum(list.map(x => x.t.paid - x.t.refunded)), total],
    };
  },

  async adjustments({ tFrom, tTo, who }) {
    const [refs, voids] = await Promise.all([
      prisma.payment.findMany({ where: { kind: "REFUND", at: { gte: tFrom, lt: tTo } }, include: folioInclude }),
      prisma.folioItem.findMany({ where: { voidedAt: { gte: tFrom, lt: tTo } }, include: folioInclude }),
    ]);
    const all = [
      ...refs.map(p => ({ at: p.at, type: "Refund", r: p.folio.reservation, desc: `${label(p.method)}: ${p.notes ?? ""}`, amt: p.amount, by: who(p.receivedById) })),
      ...voids.map(i => ({ at: i.voidedAt!, type: "Voided charge", r: i.folio.reservation, desc: `${i.description}: ${i.voidReason ?? ""}`, amt: i.qty * i.unitAmount, by: who(i.voidedById) })),
    ].sort((a, b) => +a.at - +b.at);
    return {
      title: "Refunds and voided charges", note: "Guest-level discounts aren't tracked in this version, so they don't appear here.",
      summary: [{ label: "Refunded", value: sum(refs.map(p => p.amount)), type: "money" }, { label: "Charges voided", value: sum(voids.map(i => i.qty * i.unitAmount)), type: "money" },
        { label: "Entries", value: all.length }],
      columns: [{ label: "When" }, { label: "Type" }, { label: "Reservation" }, { label: "Guest" }, { label: "Details" }, { label: "Amount", type: "money" }, { label: "By" }],
      rows: all.map(a => [when(a.at), a.type, a.r.code, a.r.guest.fullName, a.desc, a.amt, a.by]),
    };
  },

  async reservations({ dFrom, dTo }) {
    const rs = await prisma.reservation.findMany({ where: { checkIn: { gte: dFrom, lte: dTo } }, include: { guest: true, room: true }, orderBy: { checkIn: "asc" } });
    const c = rs.filter(r => r.status === "CANCELLED").length, ns = rs.filter(r => r.status === "NO_SHOW").length;
    const pct = (n: number) => (rs.length ? Math.round((n / rs.length) * 1000) / 10 : 0);
    return {
      title: "Reservations", note: "Reservations whose arrival date falls in the period. Rates are a share of all of them.",
      summary: [{ label: "Reservations", value: rs.length }, { label: "Cancelled", value: c }, { label: "Cancellation rate", value: pct(c), type: "pct" }, { label: "No-shows", value: ns }, { label: "No-show rate", value: pct(ns), type: "pct" }],
      columns: [{ label: "Reservation" }, { label: "Guest" }, { label: "Room" }, { label: "Check-in" }, { label: "Check-out" }, { label: "Nights", type: "num" }, { label: "Status" }, { label: "Source" }],
      rows: rs.map(r => [r.code, r.guest.fullName, r.room?.number ?? "Unassigned", shortDate(r.checkIn), shortDate(r.checkOut), nightsBetween(r.checkIn, r.checkOut), label(r.status), label(r.source)]),
    };
  },

  async sources({ tFrom, tTo }) {
    const rs = await prisma.reservation.findMany({ where: { createdAt: { gte: tFrom, lt: tTo } } });
    const m = new Map<string, { n: number; c: number; ns: number }>();
    for (const r of rs) { const e = m.get(r.source) ?? { n: 0, c: 0, ns: 0 }; e.n++; if (r.status === "CANCELLED") e.c++; if (r.status === "NO_SHOW") e.ns++; m.set(r.source, e); }
    const list = [...m].sort((a, b) => b[1].n - a[1].n);
    const share = (n: number) => (rs.length ? Math.round((n / rs.length) * 1000) / 10 : 0);
    return {
      title: "Booking sources", note: "Counted by the day the reservation was made, not the arrival date.",
      summary: [{ label: "Reservations made", value: rs.length }, { label: "Sources used", value: list.length }],
      columns: [{ label: "Source" }, { label: "Reservations", type: "num" }, { label: "Share", type: "pct" }, { label: "Cancelled", type: "num" }, { label: "No-shows", type: "num" }],
      rows: list.map(([s, e]) => [label(s), e.n, share(e.n), e.c, e.ns]), footer: ["Total", rs.length, rs.length ? 100 : 0, sum(list.map(([, e]) => e.c)), sum(list.map(([, e]) => e.ns))],
    };
  },

  async housekeeping({ tFrom, tTo, who }) {
    const [tasks, rooms] = await Promise.all([
      prisma.housekeepingTask.findMany({ where: { createdAt: { gte: tFrom, lt: tTo } }, include: { room: true }, orderBy: { createdAt: "asc" } }),
      prisma.room.groupBy({ by: ["status"], _count: true }),
    ]);
    const mins = (t: (typeof tasks)[number]) => (t.startedAt && t.completedAt ? Math.round((+t.completedAt - +t.startedAt) / 60000) : null);
    const timed = tasks.map(mins).filter((m): m is number => m !== null);
    const rc = (...s: string[]) => sum(rooms.filter(r => s.includes(r.status)).map(r => r._count));
    return {
      title: "Housekeeping tasks", note: "Cleaning time runs from Start cleaning to Mark clean. The 'now' figures are today's room status, whatever dates you chose.",
      summary: [{ label: "Tasks", value: tasks.length }, { label: "Finished", value: tasks.filter(t => t.status === "CLEAN" || t.status === "INSPECTED").length },
        { label: "Still open", value: tasks.filter(t => t.status === "DIRTY" || t.status === "CLEANING").length },
        { label: "Average cleaning minutes", value: timed.length ? Math.round(sum(timed) / timed.length) : null, type: "num" },
        { label: "Rooms dirty now", value: rc("DIRTY", "CLEANING") }, { label: "Rooms in maintenance now", value: rc("MAINTENANCE", "OUT_OF_ORDER") }],
      columns: [{ label: "Room" }, { label: "Status" }, { label: "Assigned to" }, { label: "Created" }, { label: "Finished" }, { label: "Cleaning minutes", type: "num" }],
      rows: tasks.map(t => [t.room.number, label(t.status), who(t.assignedToId), when(t.createdAt), when(t.completedAt), mins(t)]),
    };
  },

  async maintenance({ tFrom, tTo, who }) {
    const ts = await prisma.maintenanceTicket.findMany({ where: { createdAt: { gte: tFrom, lt: tTo } }, include: { room: true }, orderBy: { createdAt: "asc" } });
    const days = (t: (typeof ts)[number]) => (t.resolvedAt ? Math.round(((+t.resolvedAt - +t.createdAt) / DAY) * 10) / 10 : null);
    const done = ts.map(days).filter((d): d is number => d !== null);
    return {
      title: "Maintenance tickets", note: "Tickets reported in the period.",
      summary: [{ label: "Tickets", value: ts.length }, { label: "Still open", value: ts.filter(t => ["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(t.status)).length },
        { label: "Resolved or closed", value: ts.filter(t => t.status === "RESOLVED" || t.status === "CLOSED").length },
        { label: "Average days to resolve", value: done.length ? Math.round((sum(done) / done.length) * 10) / 10 : null, type: "num" }],
      columns: [{ label: "Where" }, { label: "Problem" }, { label: "Priority" }, { label: "Status" }, { label: "Reported" }, { label: "Reported by" }, { label: "Assigned to" }, { label: "Resolved" }, { label: "Days to resolve", type: "num" }],
      rows: ts.map(t => [t.room ? `Room ${t.room.number}` : t.area ?? "-", label(t.category), label(t.priority), label(t.status), when(t.createdAt), who(t.reportedById), who(t.assignedToId), when(t.resolvedAt), days(t)]),
    };
  },
};

export async function runReport(key: string, from: string, to: string): Promise<Report> {
  const fn = R[key];
  if (!fn) throw new Error("Unknown report");
  const users = await prisma.user.findMany({ select: { id: true, name: true } });
  const names = new Map(users.map(u => [u.id, u.name]));
  return fn({ from, to, dFrom: dayUTC(from), dTo: dayUTC(to), tFrom: manilaStart(from), tTo: new Date(+manilaStart(to) + DAY),
    who: id => (id ? names.get(id) ?? "—" : "—") });
}

export function toCsv(r: Report): string {
  const esc = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const out = (v: Cell, t?: ColType) =>
    typeof v === "string" ? (/^[=+\-@\t\r]/.test(v) ? "'" + v : v)   // stop spreadsheet formula injection
    : v === null ? "" : t === "money" ? (v / 100).toFixed(2) : t === "pct" ? v.toFixed(1) : String(v);
  const line = (cells: Cell[]) => cells.map((v, i) => esc(out(v, r.columns[i]?.type))).join(",");
  return [r.columns.map(c => esc(c.label)).join(","), ...r.rows.map(line), ...(r.footer ? [line(r.footer)] : [])].join("\r\n");
}