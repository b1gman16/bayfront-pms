import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { RoomButton, TypeButton, TypeRow, RoomRow } from "@/components/RoomForms";
import { formatPHP } from "@/server/domain/folio";
export const dynamic = "force-dynamic";

const TABS: [string, string[] | null][] = [["All rooms", null], ["Available", ["AVAILABLE", "CLEAN", "INSPECTED"]], ["Occupied", ["OCCUPIED"]], ["Needs cleaning", ["DIRTY", "CLEANING"]], ["Maintenance", ["MAINTENANCE", "OUT_OF_ORDER"]]];
const th = "px-4 py-3 font-medium";

export default async function Rooms(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  const canManage = can(user.role, "room.manage");
  const tab = Number(searchParams.tab ?? 0); const st = TABS[tab]?.[1];
  const [rooms, typesRaw] = await Promise.all([
    prisma.room.findMany({ where: st ? { status: { in: st as any } } : {}, include: { roomType: true }, orderBy: { number: "asc" } }),
    prisma.roomType.findMany({ orderBy: { baseRate: "asc" }, include: { _count: { select: { rooms: true } } } }),
  ]);
  const types: TypeRow[] = typesRaw.map(t => ({ id: t.id, name: t.name, ratePesos: t.baseRate / 100, maxOccupancy: t.maxOccupancy, description: t.description ?? "", active: t.active }));
  const toRow = (r: (typeof rooms)[number]): RoomRow => ({ id: r.id, number: r.number, roomTypeId: r.roomTypeId, floor: r.floor ?? "", maxOccupancy: r.maxOccupancy, amenities: r.amenities.join(", "), notes: r.notes ?? "", status: r.status });

  return (<div className="space-y-8">
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Rooms</h1>{canManage && <RoomButton types={types} />}</div>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Filter">{TABS.map(([l], i) => (
        <Link key={l} href={`/rooms?tab=${i}`} className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2 text-sm ${i === tab ? "border-brand font-medium text-brand" : "border-transparent text-slate-500"}`}>{l}</Link>))}</nav>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
          {["Room", "Type", "Floor", "Max guests", "Status", "Rate per night"].map(h => <th key={h} className={th}>{h}</th>)}{canManage && <th className={th}><span className="sr-only">Edit</span></th>}</tr></thead>
          <tbody>{rooms.map(r => (<tr key={r.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{r.number}</td><td className="px-4">{r.roomType.name}</td>
            <td className="px-4">{r.floor ?? "-"}</td><td className="px-4">{r.maxOccupancy}</td><td className="px-4"><StatusBadge status={r.status} /></td>
            <td className="px-4">{formatPHP(r.roomType.baseRate)}</td>{canManage && <td className="px-4 text-right"><RoomButton room={toRow(r)} types={types} /></td>}</tr>))}</tbody></table>
        {rooms.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No rooms in this group.</p>}</div>

      <div className="space-y-2 md:hidden">
        {rooms.map(r => (<div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-0"><div className="text-lg font-semibold">Room {r.number}</div>
            <div className="text-sm text-slate-500">{r.roomType.name} · Floor {r.floor ?? "-"} · up to {r.maxOccupancy}</div>
            <div className="mt-1 text-sm">{formatPHP(r.roomType.baseRate)} per night</div></div>
          <div className="flex shrink-0 flex-col items-end gap-2"><StatusBadge status={r.status} />{canManage && <RoomButton room={toRow(r)} types={types} />}</div></div>))}
        {rooms.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No rooms in this group.</p>}</div>
    </section>

    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">Room types and rates</h2>{canManage && <TypeButton />}</div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
          {["Type", "Rate per night", "Max guests", "Rooms", "Status"].map(h => <th key={h} className={th}>{h}</th>)}{canManage && <th className={th}><span className="sr-only">Edit</span></th>}</tr></thead>
          <tbody>{typesRaw.map((t, i) => (<tr key={t.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{t.name}</td><td className="px-4">{formatPHP(t.baseRate)}</td>
            <td className="px-4">{t.maxOccupancy}</td><td className="px-4">{t._count.rooms}</td>
            <td className="px-4">{t.active ? <span className="text-emerald-700">Active</span> : <span className="text-slate-500">Inactive</span>}</td>
            {canManage && <td className="px-4 text-right"><TypeButton type={types[i]} /></td>}</tr>))}</tbody></table></div>
    </section></div>);
}