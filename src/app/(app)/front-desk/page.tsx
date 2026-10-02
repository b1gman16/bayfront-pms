import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { CheckInButton, AssignRoom } from "@/components/FrontDeskActions";
export const dynamic = "force-dynamic";
const card = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";
const iso = (d: Date) => d.toISOString().slice(0, 10);

export default async function FrontDesk() {
  const user = (await getServerSession(authOptions))?.user as any;
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z");
  const [arrivals, inHouse] = await Promise.all([
    prisma.reservation.findMany({ where: { status: { in: ["PENDING", "CONFIRMED"] }, checkIn: { lte: today }, checkOut: { gt: today } }, include: { guest: true, room: true, roomType: true }, orderBy: { checkIn: "asc" } }),
    prisma.reservation.findMany({ where: { status: "CHECKED_IN" }, include: { guest: true, room: true }, orderBy: { checkOut: "asc" } }),
  ]);
  return (<div className="space-y-5"><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Check-in / Check-out</h1>
    {can(user.role, "reservation.create") && <Link href="/reservations/new" className="rounded-md bg-brand px-3.5 py-2 text-sm font-medium text-white">New reservation / walk-in</Link>}</div>
    <section className={card}><h2 className="mb-3 font-semibold">Arrivals ({arrivals.length})</h2>
      {arrivals.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">No arrivals waiting.</p> : arrivals.map(r => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 py-3 text-sm first:border-0">
          <div><div className="font-medium">{r.guest.fullName}</div><div className="text-slate-500">{r.code} · {r.roomType.name} · {r.adults + r.children} guest(s){r.checkIn < today ? " · arrival date has passed" : ""}</div></div>
          {r.room ? <div className="flex items-center gap-4"><span className="font-medium">Room {r.room.number}</span>
            {can(user.role, "checkin") && <CheckInButton id={r.id} version={r.version} label={`${r.guest.fullName} into Room ${r.room.number}`} canOverride={can(user.role, "checkout.override")} />}</div>
            : <AssignRoom id={r.id} roomTypeId={r.roomTypeId} from={iso(r.checkIn)} to={iso(r.checkOut)} />}</div>))}</section>
    <section className={card}><h2 className="mb-3 font-semibold">In house ({inHouse.length})</h2>
      {inHouse.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">No guests checked in.</p> : inHouse.map(r => (
        <div key={r.id} className="flex items-center justify-between border-t border-slate-100 py-3 text-sm first:border-0">
          <div><div className="font-medium">{r.guest.fullName} · Room {r.room?.number}</div>
            <div className={r.checkOut <= today ? "text-red-600" : "text-slate-500"}>{r.code} · leaves {r.checkOut.toLocaleDateString("en-PH", { month: "short", day: "numeric", timeZone: "UTC" })}{r.checkOut <= today ? " (due today)" : ""}</div></div>
          <Link href={`/front-desk/${r.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Bill / check out</Link></div>))}</section></div>);
}