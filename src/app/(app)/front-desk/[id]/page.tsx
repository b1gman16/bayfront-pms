import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { computeFolio, formatPHP } from "@/server/domain/folio";
import { isRoomFree, nightsBetween } from "@/server/domain/availability";
import { getFolioTotals } from "@/server/services/reservations";
import FolioActions from "@/components/FolioActions";
import MoveRoom, { RoomOption } from "@/components/MoveRoom";
import { RefundButton, VoidButton } from "@/components/BillActions";
import StatusBadge from "@/components/StatusBadge";
   import { ratesFor, sumRates } from "@/server/domain/rates";
export const dynamic = "force-dynamic";
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const dt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function Bill(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = (await getServerSession(authOptions))?.user as any;
  const r = await prisma.reservation.findUnique({ where: { id }, include: { guest: true, room: true, folio: true } });
  if (!r || !r.folio) notFound();
  const [{ folio, totals: t }, live] = await Promise.all([getFolioTotals(r.folio.id), prisma.feeRule.findMany()]);

  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");
  const upcoming = ["PENDING", "CONFIRMED"].includes(r.status);
  const open = r.status === "CHECKED_IN" && !folio.closedAt;
     const nights = nightsBetween(r.checkIn, r.checkOut);
   const roomTotal = sumRates(ratesFor(r));

  // Rooms this guest could be moved to: ready, big enough, and free for the rest of the stay.
  let options: RoomOption[] = [];
  const canMove = open && r.checkOut > today && can(user.role, "reservation.edit");
  if (canMove) {
    const [rooms, stays] = await Promise.all([
      prisma.room.findMany({ include: { roomType: true }, orderBy: { number: "asc" } }),
      prisma.reservation.findMany({ where: { roomId: { not: null } } }),
    ]);
    options = rooms
      .filter(x => x.id !== r.roomId && ["AVAILABLE", "CLEAN", "INSPECTED"].includes(x.status) && x.maxOccupancy >= r.adults + r.children && isRoomFree(x, stays, r.checkIn, r.checkOut, r.id))
      .map(x => ({ id: x.id, number: x.number, typeName: x.roomType.name, sameType: x.roomTypeId === r.roomTypeId }));
  }

  // Before check-in there is no room charge yet, so show an estimate that includes it.
  const lines = folio.items.map(i => ({ qty: i.qty, unitAmount: i.unitAmount, voided: !!i.voidedAt }));
  if (upcoming)    lines.push({ qty: 1, unitAmount: roomTotal, voided: false });
  const tt = upcoming ? computeFolio(lines, live, folio.payments) : t;

  const canVoid = open && can(user.role, "folio.void");
  const canRefund = can(user.role, "payment.refund");
  const refundedOf = (pid: string) => folio.payments.filter(x => x.kind === "REFUND" && x.refundOfId === pid).reduce((s, x) => s + x.amount, 0);
  const row = (l: string, v: string, bold = false) => <div className={`flex justify-between py-1 ${bold ? "border-t border-slate-200 pt-2 font-semibold" : ""}`}><span>{l}</span><span>{v}</span></div>;
  const closedNote = r.status === "CHECKED_OUT" ? `This folio is closed. Checked out ${r.checkedOutAt?.toLocaleString("en-PH", { timeZone: "Asia/Manila" })}.`
    : r.status === "CANCELLED" ? "This reservation was cancelled, so the bill is closed."
    : r.status === "NO_SHOW" ? "This guest did not arrive." : "This folio is closed.";

  return (<div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold">{r.guest.fullName}</h1>
      <p className="text-sm text-slate-500">{r.code} · Room {r.room?.number ?? "not assigned"} · {dt(r.checkIn)} to {dt(r.checkOut)}</p></div>
      <div className="flex items-center gap-3">{canMove && r.room && <MoveRoom reservationId={r.id} version={r.version} current={r.room.number} options={options} ratePesos={r.ratePerNight / 100} />}<StatusBadge status={r.status} /></div></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={card}><h2 className="mb-2 font-semibold">Charges</h2>
        {upcoming && <div className="flex justify-between py-2 text-sm text-slate-500"><span>Room × {nights} night{nights === 1 ? "" : "s"} (estimate)</span><span>   {formatPHP(roomTotal)}</span></div>}
        {folio.items.map(i => (<div key={i.id} className="border-t border-slate-100 py-2 text-sm first:border-0">
          <div className={`flex justify-between ${i.voidedAt ? "text-slate-400 line-through" : ""}`}><span>{i.description}{i.qty > 1 && !/×/.test(i.description) ? ` × ${i.qty}` : ""}</span><span>{formatPHP(i.qty * i.unitAmount)}</span></div>
          {i.voidedAt ? <div className="text-xs text-slate-500">Voided: {i.voidReason}</div>
            : canVoid && i.category !== "ROOM" && <VoidButton itemId={i.id} label={i.description} />}</div>))}
        <div className="mt-2 text-sm">{row("Subtotal", formatPHP(tt.subtotal), true)}{tt.breakdown.map(b => row(b.name, formatPHP(b.amount)))}{row(upcoming ? "Estimated total" : "Total", formatPHP(tt.total), true)}</div></section>
      <section className={card}><h2 className="mb-2 font-semibold">Payments</h2>
        {folio.payments.length === 0 ? <p className="py-2 text-sm text-slate-500">No payments yet.</p> : folio.payments.map(p => {
          const left = p.kind === "PAYMENT" ? p.amount - refundedOf(p.id) : 0;
          return (<div key={p.id} className="border-t border-slate-100 py-2 text-sm first:border-0">
            <div className="flex justify-between"><span>{p.kind === "REFUND" ? "Refund · " : p.notes === "Deposit" ? "Deposit · " : ""}{p.method}{p.reference ? ` (${p.reference})` : ""} · {p.at.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" })}</span>
              <span className={p.kind === "REFUND" ? "text-red-600" : ""}>{p.kind === "REFUND" ? "-" : ""}{formatPHP(p.amount)}</span></div>
            <div className="flex flex-wrap items-center gap-3"><Link href={`/receipts/${p.id}`} target="_blank" className="text-xs text-brand">Receipt</Link>
              {canRefund && left > 0 && <RefundButton paymentId={p.id} maxCentavos={left} />}</div></div>);
        })}
        <div className="mt-2 text-sm">{row(upcoming ? "Deposits held" : "Paid", formatPHP(tt.paid - tt.refunded))}{row(upcoming ? "Estimated balance on arrival" : "Balance due", formatPHP(tt.balance), true)}</div></section></div>
    {open ? <FolioActions reservationId={r.id} folioId={folio.id} balance={t.balance}    canOverride={can(user.role, "checkout.override")} canDiscount={can(user.role, "folio.discount")} canCheckout={can(user.role, "checkout")} />
      : upcoming ? <p className="rounded bg-blue-50 p-3 text-sm text-blue-900">This guest hasn't checked in yet. Record more deposits or add a cancellation fee on the <Link href={`/reservations/${r.id}`} className="underline">reservation page</Link>. Room charges and check-out start at check-in.</p>
      : <p className="rounded bg-slate-100 p-3 text-sm text-slate-600">{closedNote}</p>}</div>);
}