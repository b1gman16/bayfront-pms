import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import StatusBadge from "@/components/StatusBadge";
import { NewTicket, TicketActions } from "@/components/MaintenanceUI";
export const dynamic = "force-dynamic";

const TABS: [string, string[]][] = [["Open", ["OPEN", "ASSIGNED", "IN_PROGRESS"]], ["Resolved", ["RESOLVED"]], ["Closed", ["CLOSED"]]];
const RANK: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
const TONE: Record<string, string> = { URGENT: "bg-red-100 text-red-800", HIGH: "bg-orange-100 text-orange-800", NORMAL: "bg-slate-100 text-slate-700", LOW: "bg-slate-50 text-slate-500" };
const CAT: Record<string, string> = { AIRCON: "Air-conditioning", PLUMBING: "Plumbing", ELECTRICAL: "Electrical", INTERNET: "Internet / Wi-Fi", FURNITURE: "Furniture", APPLIANCE: "Appliance", OTHER: "Other" };
const when = (d: Date) => d.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" });

export default async function Maintenance(props: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  const tab = Math.min(Math.max(Number(sp.tab ?? 0) || 0, 0), 2);
  const canManage = can(user.role, "maintenance.manage");
  const [raw, rooms, users] = await Promise.all([
    prisma.maintenanceTicket.findMany({ where: { status: { in: TABS[tab][1] as any } }, include: { room: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.room.findMany({ orderBy: { number: "asc" }, select: { id: true, number: true } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const name = (id: string | null) => users.find(u => u.id === id)?.name ?? "—";
  const tickets = tab === 0 ? [...raw].sort((a, b) => RANK[a.priority] - RANK[b.priority] || +a.createdAt - +b.createdAt) : raw;

  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Maintenance</h1>
      <NewTicket rooms={rooms} canBlock={canManage || can(user.role, "room.status")} /></div>
    <nav className="flex gap-1 border-b border-slate-200" aria-label="Filter">{TABS.map(([l], i) => (
      <Link key={l} href={`/maintenance?tab=${i}`} className={`-mb-px border-b-2 px-4 py-2 text-sm ${i === tab ? "border-brand font-medium text-brand" : "border-transparent text-slate-500"}`}>{l}</Link>))}</nav>
    {tickets.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
      {tab === 0 ? "No open problems. Everything is working." : "Nothing here."}</p>}
    <div className="space-y-3">{tickets.map(t => (
      <article key={t.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold">{t.room ? `Room ${t.room.number}` : t.area}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[t.priority]}`}>{t.priority[0] + t.priority.slice(1).toLowerCase()}</span>
          <StatusBadge status={t.status} /><span className="text-sm text-slate-500">{CAT[t.category]}</span></div>
        <p className="text-sm">{t.description}</p>
        <p className="text-xs text-slate-500">Reported by {name(t.reportedById)} · {when(t.createdAt)} · Assigned to {name(t.assignedToId)}
          {t.room && t.room.status === "MAINTENANCE" ? " · Room is blocked" : ""}</p>
        {t.resolution && <p className="rounded bg-emerald-50 p-2 text-sm text-emerald-800">Fixed: {t.resolution}{t.resolvedAt ? ` (${when(t.resolvedAt)})` : ""}</p>}
        <TicketActions id={t.id} status={t.status} assignedToId={t.assignedToId ?? ""} staff={users} canManage={canManage} isAssignee={t.assignedToId === user.id} />
      </article>))}</div></div>);
}