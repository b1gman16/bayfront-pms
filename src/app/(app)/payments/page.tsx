import Link from "next/link";
import { prisma } from "@/server/db";
import { formatPHP } from "@/server/domain/folio";
export const dynamic = "force-dynamic";

const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

export default async function Payments() {
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const since = new Date(`${day}T00:00:00+08:00`);
  const rows = await prisma.payment.findMany({ orderBy: { at: "desc" }, take: 100,
    include: { folio: { include: { reservation: { include: { guest: true } } } } } });
  const todays = rows.filter(r => r.at >= since);
  const byMethod = new Map<string, number>();
  for (const r of todays) byMethod.set(r.method, (byMethod.get(r.method) ?? 0) + (r.kind === "REFUND" ? -r.amount : r.amount));
  const net = [...byMethod.values()].reduce((a, b) => a + b, 0);

  return (<div className="space-y-5"><h1 className="text-2xl font-semibold">Payments</h1>
    <div className="grid gap-4 md:grid-cols-3">
      <div className={card}><div className="text-sm text-slate-500">Collected today (net of refunds)</div><div className="text-3xl font-semibold">{formatPHP(net)}</div></div>
      <div className={`${card} md:col-span-2`}><div className="mb-2 text-sm text-slate-500">By payment method, today</div>
        {byMethod.size === 0 ? <p className="text-sm text-slate-500">No payments yet today.</p> :
          <div className="flex flex-wrap gap-x-8 gap-y-2">{[...byMethod].map(([m, v]) => <div key={m}><div className="text-xs text-slate-500">{m.replace("_", " ")}</div><div className="font-semibold">{formatPHP(v)}</div></div>)}</div>}</div></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Date", "Guest", "Reservation", "Method", "Reference", "Amount", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => (<tr key={r.id} className="border-t border-slate-100">
          <td className="px-4 py-3">{r.at.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}</td>
          <td className="px-4">{r.folio.reservation.guest.fullName}</td>
          <td className="px-4"><Link href={`/front-desk/${r.folio.reservationId}`} className="text-brand">{r.folio.reservation.code}</Link></td>
          <td className="px-4">{r.method.replace("_", " ")}{r.kind === "REFUND" ? " (refund)" : ""}</td><td className="px-4 text-slate-500">{r.reference ?? "-"}</td>
          <td className={`px-4 font-medium ${r.kind === "REFUND" ? "text-red-600" : ""}`}>{r.kind === "REFUND" ? "-" : ""}{formatPHP(r.amount)}</td>
          <td className="px-4"><Link href={`/receipts/${r.id}`} className="text-brand">Receipt</Link></td></tr>))}</tbody></table>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No payments recorded yet.</p>}</div></div>);
}