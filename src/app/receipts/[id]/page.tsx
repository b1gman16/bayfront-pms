import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { computeFolio, formatPHP, rulesForFolio } from "@/server/domain/folio";
import { getResort } from "@/server/services/settings";
import { PrintButton } from "@/components/BillActions";
export const dynamic = "force-dynamic";

const dt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function Receipt(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const s = (await getServerSession(authOptions))?.user as any;
  if (!s) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: s.id }, select: { role: true, active: true, mustChangePassword: true } });
  if (!user || !user.active || user.mustChangePassword) redirect("/login");
  if (!can(user.role, "payment.view")) notFound();

  const p = await prisma.payment.findUnique({ where: { id }, include: { folio: { include: { items: true, payments: true, reservation: { include: { guest: true, room: true } } } } } });
  if (!p) notFound();
  const [live, receiver, resort] = await Promise.all([prisma.feeRule.findMany(), prisma.user.findUnique({ where: { id: p.receivedById } }), getResort()]);
  const res = p.folio.reservation;
  const rules = rulesForFolio(p.folio.rulesSnapshot, live);   // a closed bill keeps the rules it was closed with
  const t = computeFolio(p.folio.items.map(i => ({ qty: i.qty, unitAmount: i.unitAmount, voided: !!i.voidedAt })), rules, p.folio.payments);
  const refund = p.kind === "REFUND";
  const row = (l: string, v: string, bold = false) => <div className={`flex justify-between py-1 ${bold ? "border-t border-slate-300 pt-2 font-semibold" : ""}`}><span>{l}</span><span>{v}</span></div>;

  return (<div className="mx-auto max-w-md p-6">
    <style>{`@media print { .no-print { display: none !important; } body { background: #fff !important; } .sheet { box-shadow: none !important; border: 0 !important; } }`}</style>
    <div className="no-print mb-4 flex items-center justify-between">
      <Link href={`/front-desk/${res.id}`} className="text-sm text-brand">← Back to bill</Link><PrintButton /></div>
    <div className="sheet space-y-4 rounded-xl border border-slate-200 bg-white p-8 text-sm shadow-sm">
      <header className="border-b border-slate-200 pb-4 text-center">
        <div className="font-logo text-xl uppercase tracking-widest">{resort.name}</div>
        {resort.address && <div className="mt-1 text-xs text-slate-500">{resort.address}</div>}
        {resort.phone && <div className="text-xs text-slate-500">{resort.phone}</div>}
        {resort.tin && <div className="text-xs text-slate-500">{resort.tin}</div>}
        <div className="mt-3 text-base font-semibold">{refund ? "REFUND RECEIPT" : "PAYMENT RECEIPT"}</div>
        <div className="text-xs text-slate-500">No. {p.id.slice(-8).toUpperCase()} · {p.at.toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" })}</div></header>
      <section>{row("Guest", res.guest.fullName)}{row("Reservation", res.code)}{row("Room", res.room?.number ?? "-")}{row("Stay", `${dt(res.checkIn)} to ${dt(res.checkOut)}`)}</section>
      <section className="rounded-lg bg-slate-50 p-4">
        {row(refund ? "Refunded via" : "Paid by", p.method.replace("_", " "))}{p.reference && row("Reference", p.reference)}
        {refund && p.notes && row("Reason", p.notes)}
        <div className="mt-2 flex justify-between border-t border-slate-300 pt-2 text-lg font-semibold"><span>{refund ? "Amount refunded" : "Amount received"}</span><span>{refund ? "-" : ""}{formatPHP(p.amount)}</span></div></section>
      <section><div className="mb-1 font-medium">Account summary</div>
        {row("Total charges", formatPHP(t.total))}{row("Total paid", formatPHP(t.paid - t.refunded))}{row("Balance", formatPHP(t.balance), true)}</section>
      <footer className="border-t border-slate-200 pt-3 text-center text-xs text-slate-500">Received by {receiver?.name ?? "staff"}.<br />{resort.footer || `Thank you for staying at ${resort.name}.`}</footer>
    </div></div>);
}