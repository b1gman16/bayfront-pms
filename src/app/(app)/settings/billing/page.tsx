import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { computeFolio, formatPHP } from "@/server/domain/folio";
import { getResort } from "@/server/services/settings";
import { RuleButton, ToggleRule, ResortForm, RuleRow } from "@/components/BillingSettings";
export const dynamic = "force-dynamic";

const KIND: Record<string, string> = { TAX: "Tax", FEE: "Service charge / fee", DISCOUNT: "Discount" };

export default async function BillingSettings() {
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "rate.manage")) notFound();
  const [rules, resort] = await Promise.all([
    prisma.feeRule.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }), getResort(),
  ]);
  const rows: RuleRow[] = rules.map(r => ({ id: r.id, name: r.name, kind: r.kind, type: r.type, amount: r.value / 100, compound: r.compound, active: r.active, sortOrder: r.sortOrder }));
  const sample = computeFolio([{ qty: 1, unitAmount: 10_000_00 }], rules, []);
  const how = (r: RuleRow) => r.type === "PERCENT" ? `${r.amount}% of the bill${r.compound ? ", including the service charge" : ""}` : `${formatPHP(r.amount * 100)} once per bill`;
  const nextOrder = (Math.max(0, ...rules.map(r => r.sortOrder)) || 0) + 10;

  return (<div className="space-y-6">
    <div className="flex items-center justify-between"><div><h2 className="text-2xl font-semibold">Taxes, fees and discounts</h2>
      <p className="text-sm text-slate-500">How the total on every guest bill is worked out.</p></div><RuleButton nextOrder={nextOrder} /></div>

    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      <b>Before you change a rate:</b> a change also applies to existing bills and receipts, including guests who already checked out, because bills are always worked out from the current rules.
      Make changes when no one is checking out, and keep a note of the old rate for your records.</p>

    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Name", "Type", "How it's calculated", "Order", "Status", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.map(r => (<tr key={r.id} className="border-t border-slate-100">
          <td className="px-4 py-3 font-medium">{r.name}</td><td className="px-4">{KIND[r.kind]}</td><td className="px-4">{how(r)}</td><td className="px-4">{r.sortOrder}</td>
          <td className="px-4">{r.active ? <span className="text-emerald-700">On</span> : <span className="text-slate-500">Off</span>}</td>
          <td className="px-4 text-right"><div className="flex items-center justify-end gap-3"><ToggleRule rule={r} /><RuleButton rule={r} /></div></td></tr>))}</tbody></table>
      {rows.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No rules yet. Bills currently have no tax, fee or discount.</p>}</div>

    <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-semibold">Check it: a ₱10,000 bill</h2>
      <div className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPHP(sample.subtotal)}</span></div>
        {sample.breakdown.map(b => <div key={b.name} className="flex justify-between text-slate-600"><span>{b.name}</span><span>{formatPHP(b.amount)}</span></div>)}
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold"><span>Total</span><span>{formatPHP(sample.total)}</span></div></div>
      <p className="mt-3 text-xs text-slate-500">This uses the rules that are turned on right now. If it isn't what you expect, fix the rules before staff use them.</p></section>

    <ResortForm resort={resort} />
  </div>);
}