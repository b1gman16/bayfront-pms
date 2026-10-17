import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
export const dynamic = "force-dynamic";

const TABS: [string, string[] | null][] = [["All", null], ["Upcoming", ["PENDING", "CONFIRMED"]], ["Checked in", ["CHECKED_IN"]], ["Checked out", ["CHECKED_OUT"]], ["Cancelled", ["CANCELLED", "NO_SHOW"]]];
const d = (x: Date) => x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function Reservations(props: { searchParams: Promise<{ q?: string; tab?: string }> }) {
  const searchParams = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  const q = searchParams.q?.trim(); const tab = Number(searchParams.tab ?? 0); const st = TABS[tab]?.[1];
  const rows = await prisma.reservation.findMany({
    where: { ...(st ? { status: { in: st as any } } : {}), ...(q ? { OR: [
      { code: { contains: q, mode: "insensitive" } }, { guest: { fullName: { contains: q, mode: "insensitive" } } },
      { guest: { phone: { contains: q } } }, { room: { number: q } }] } : {}) },
    include: { guest: true, room: { include: { roomType: true } } }, orderBy: { checkIn: "desc" }, take: 100 });
  const roomOf = (r: (typeof rows)[number]) => (r.room ? `${r.room.roomType.name} ${r.room.number}` : "Unassigned");
  return (<div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Reservations</h1>
      {can(user.role, "reservation.create") && <Link href="/reservations/new" className="rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white">New reservation</Link>}</div>
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Filter">{TABS.map(([l], i) => (
      <Link key={l} href={`/reservations?tab=${i}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
        className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm ${i === tab ? "border-brand font-medium text-brand" : "border-transparent text-slate-500"}`}>{l}</Link>))}</nav>
    {q && <p className="text-sm text-slate-500">Results for “{q}”. <Link href="/reservations" className="text-brand">Clear</Link></p>}

    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Guest", "Code", "Room", "Check-in", "Check-out", "Status"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => <tr key={r.id} className="border-t border-slate-100">
          <td className="px-4 py-3 font-medium"><Link href={`/reservations/${r.id}`} className="hover:text-brand">{r.guest.fullName}</Link></td>
          <td className="px-4 text-slate-500">{r.status === "CHECKED_IN" ? <Link href={`/front-desk/${r.id}`} className="text-brand">{r.code}</Link> : r.code}</td>
          <td className="px-4">{roomOf(r)}</td>
          <td className="px-4">{d(r.checkIn)}</td><td className="px-4">{d(r.checkOut)}</td><td className="px-4"><StatusBadge status={r.status} /></td></tr>)}</tbody></table>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No reservations found.</p>}</div>

    <div className="space-y-2 md:hidden">
      {rows.map(r => (<Link key={r.id} href={`/reservations/${r.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50">
        <div className="flex items-start justify-between gap-2"><div className="font-semibold">{r.guest.fullName}</div><StatusBadge status={r.status} /></div>
        <div className="mt-1 text-sm text-slate-500">{r.code} · {roomOf(r)}</div>
        <div className="mt-1 text-sm">{d(r.checkIn)} to {d(r.checkOut)}</div></Link>))}
      {rows.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No reservations found.</p>}</div>
  </div>);
}