import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { getFolioTotals } from "@/server/services/reservations";
import FolioActions from "@/components/FolioActions";
import { RefundButton, VoidButton } from "@/components/BillActions";
import StatusBadge from "@/components/StatusBadge";
export const dynamic = "force-dynamic";
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const dt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function Bill(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = (await getServerSession(authOptions))?.user as any;
  const r = await prisma.reservation.findUnique({ where: { id }, include: { guest: true, room: true, folio: true } });
  if (!r || !r.folio) notFound();
  const { folio, totals: t } = await getFolioTotals(r.folio.id);
  const open = r.status === "CHECKED_IN" && !folio.closedAt;
  const canVoid = open && can(user.role, "folio.void");
  const canRefund = can(user.role, "payment.refund");
  const refundedOf = (pid: string) => folio.payments.filter(x => x.kind === "REFUND" && x.refundOfId === pid).reduce((s, x) => s + x.amount, 0);
  const row = (l: string, v: string, bold = false) => <div className={`flex justify-between py-1 ${bold ? "border-t border-slate-200 pt-2 font-semibold" : ""}`}><span>{l}</span><span>{v}</span></div>;

  return (<div className="space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">{r.guest.fullName}</h1>
      <p className="text-sm text-slate-500">{r.code} · Room {r.room?.number} · {dt(r.checkIn)} to {dt(r.checkOut)}</p></div><StatusBadge status={r.status} /></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={card}><h2 className="mb-2 font-semibold">Charges</h2>
        {folio.items.map(i => (<div key={i.id} className="border-t border-slate-100 py-2 text-sm first:border-0">
          <div className={`flex justify-between ${i.voidedAt ? "text-slate-400 line-through" : ""}`}><span>{i.description}{i.qty > 1 ? ` × ${i.qty}` : ""}</span><span>{formatPHP(i.qty * i.unitAmount)}</span></div>
          {i.voidedAt ? <div className="text-xs text-slate-500">Voided: {i.voidReason}</div>
            : canVoid && i.category !== "ROOM" && <VoidButton itemId={i.id} label={i.description} />}</div>))}
        <div className="mt-2 text-sm">{row("Subtotal", formatPHP(t.subtotal), true)}{t.breakdown.map(b => row(b.name, formatPHP(b.amount)))}{row("Total", formatPHP(t.total), true)}</div></section>
      <section className={card}><h2 className="mb-2 font-semibold">Payments</h2>
        {folio.payments.length === 0 ? <p className="py-2 text-sm text-slate-500">No payments yet.</p> : folio.payments.map(p => {
          const left = p.kind === "PAYMENT" ? p.amount - refundedOf(p.id) : 0;
          return (<div key={p.id} className="border-t border-slate-100 py-2 text-sm first:border-0">
            <div className="flex justify-between"><span>{p.kind === "REFUND" ? "Refund · " : ""}{p.method}{p.reference ? ` (${p.reference})` : ""} · {p.at.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}</span>
              <span className={p.kind === "REFUND" ? "text-red-600" : ""}>{p.kind === "REFUND" ? "-" : ""}{formatPHP(p.amount)}</span></div>
            <div className="flex flex-wrap items-center gap-3"><Link href={`/receipts/${p.id}`} target="_blank" className="text-xs text-brand">Receipt</Link>
              {canRefund && left > 0 && <RefundButton paymentId={p.id} maxCentavos={left} />}</div></div>);
        })}
        <div className="mt-2 text-sm">{row("Paid", formatPHP(t.paid - t.refunded))}{row("Balance due", formatPHP(t.balance), true)}</div></section></div>
    {open ? <FolioActions reservationId={r.id} folioId={folio.id} balance={t.balance} canOverride={can(user.role, "checkout.override")} />
      : <p className="rounded bg-slate-100 p-3 text-sm text-slate-600">This folio is closed. Checked out {r.checkedOutAt?.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}.</p>}</div>);
}