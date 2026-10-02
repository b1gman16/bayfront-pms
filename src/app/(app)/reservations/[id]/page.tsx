import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { nightsBetween } from "@/server/domain/availability";
import StatusBadge from "@/components/StatusBadge";
import ReservationEditor from "@/components/ReservationEditor";
export const dynamic = "force-dynamic";

const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const dt = (d: Date) => d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function ReservationPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = (await getServerSession(authOptions))?.user as any;
  const r = await prisma.reservation.findUnique({ where: { id }, include: { guest: true, room: true, roomType: true, folio: true } });
  if (!r) notFound();
  const creator = await prisma.user.findUnique({ where: { id: r.createdById } });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const editable = ["PENDING", "CONFIRMED", "CHECKED_IN"].includes(r.status);
  const canEdit = editable && can(user.role, "reservation.edit");
  const canCancel = can(user.role, "reservation.cancel");
  const nights = nightsBetween(r.checkIn, r.checkOut);
  const row = (l: string, v: React.ReactNode) => <div className="flex justify-between gap-4 border-t border-slate-100 py-2 text-sm first:border-0"><span className="text-slate-500">{l}</span><span className="text-right">{v}</span></div>;

  return (<div className="space-y-5">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">{r.guest.fullName}</h1>
      <p className="text-sm text-slate-500">{r.code} · created {r.createdAt.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" })} by {creator?.name ?? "staff"}</p></div>
      <StatusBadge status={r.status} /></div>
    <div className="grid gap-5 lg:grid-cols-5">
      <section className={`${card} lg:col-span-2`}>
        {row("Phone", r.guest.phone ?? "-")}{row("Email", r.guest.email ?? "-")}
        {row("Stay", `${dt(r.checkIn)} to ${dt(r.checkOut)} (${nights} night${nights === 1 ? "" : "s"})`)}
        {row("Room", r.room ? `${r.roomType.name} ${r.room.number}` : `${r.roomType.name} (unassigned)`)}
        {row("Guests", `${r.adults} adult(s), ${r.children} child(ren)`)}{row("Rate", `${formatPHP(r.ratePerNight)} per night`)}
        {row("Estimated room total", formatPHP(r.ratePerNight * nights))}{row("Source", r.source.replace("_", " "))}
        {r.specialRequests && row("Requests", r.specialRequests)}{r.internalNotes && row("Notes", r.internalNotes)}
        {r.cancelReason && row("Cancelled because", r.cancelReason)}
        {r.folio && <div className="pt-3"><Link href={`/front-desk/${r.id}`} className="text-sm text-brand">Open bill and payments →</Link></div>}
      </section>
      <div className="lg:col-span-3">
        {editable ? <ReservationEditor id={r.id} version={r.version} status={r.status} checkIn={iso(r.checkIn)} checkOut={iso(r.checkOut)}
          adults={r.adults} children={r.children} source={r.source} specialRequests={r.specialRequests ?? ""} internalNotes={r.internalNotes ?? ""}
          roomId={r.roomId ?? ""} roomNumber={r.room?.number ?? ""} roomTypeId={r.roomTypeId} today={today} canEdit={canEdit} canCancel={canCancel} />
          : <p className="rounded bg-slate-100 p-4 text-sm text-slate-600">This reservation is {r.status.toLowerCase().replace("_", " ")} and can no longer be edited.</p>}
      </div></div></div>);
}