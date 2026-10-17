import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { RateButton, ToggleRate, PriceCheck, RateRow } from "@/components/RatesUI";
export const dynamic = "force-dynamic";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function Rates() {
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "rate.manage")) notFound();
  const [rules, types] = await Promise.all([
    prisma.rateRule.findMany({ orderBy: [{ active: "desc" }, { priority: "desc" }, { name: "asc" }] }),
    prisma.roomType.findMany({ where: { active: true }, orderBy: { baseRate: "asc" } }),
  ]);
  const opts = types.map(t => ({ id: t.id, name: t.name }));
  const typeName = (id: string | null) => (id ? types.find(t => t.id === id)?.name ?? "(inactive type)" : "All room types");

  return (<div className="space-y-6">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold">Room rates</h2>
      <p className="text-sm text-slate-500">Seasonal and weekend prices. With no rule, each room type's base rate applies.</p></div><RateButton types={opts} /></div>
    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <b>How it works:</b> a rule sets the price for the <i>nights</i> it covers. If several rules cover the same night, the one with the higher priority wins. Rates only affect bookings made
      or changed from now on: existing reservations keep the price they were booked at, and nights added to a stay are priced at today's rates.</p>

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Name", "Room type", "Price per night", "When", "Priority", "Status", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rules.map(r => {
          const row: RateRow = { id: r.id, name: r.name, roomTypeId: r.roomTypeId ?? "", startDate: iso(r.startDate), endDate: iso(r.endDate), days: r.days, ratePesos: r.rate / 100, priority: r.priority, active: r.active };
          const when = [r.startDate || r.endDate ? `${iso(r.startDate) || "…"} to ${iso(r.endDate) || "…"}` : "", r.days.length ? r.days.map(d => DAYS[d]).join(", ") : ""].filter(Boolean).join(" · ") || "Every night";
          return (<tr key={r.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4">{typeName(r.roomTypeId)}</td><td className="px-4">{formatPHP(r.rate)}</td>
            <td className="px-4 text-slate-600">{when}</td><td className="px-4">{r.priority}</td>
            <td className="px-4">{r.active ? <span className="text-emerald-700">On</span> : <span className="text-slate-500">Off</span>}</td>
            <td className="px-4 text-right"><div className="flex items-center justify-end gap-3"><ToggleRate rule={row} /><RateButton rule={row} types={opts} /></div></td></tr>);
        })}</tbody></table>
      {rules.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No rate rules yet. Every booking uses the room type's base rate.</p>}</div>

    <PriceCheck types={opts} />
  </div>);
}