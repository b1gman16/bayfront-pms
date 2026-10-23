import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { decrypt, maskId } from "@/server/crypto";
import StatusBadge from "@/components/StatusBadge";
import { GuestEditor } from "@/components/GuestUI";
export const dynamic = "force-dynamic";

const d = (x?: Date | null) => (x ? x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—");

export default async function GuestPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "guest.view")) notFound();
  const g = await prisma.guest.findUnique({ where: { id } });
  if (!g) notFound();
  const [res, pays] = await Promise.all([
    prisma.reservation.findMany({ where: { guestId: id }, include: { room: true }, orderBy: { checkIn: "desc" }, take: 100 }),
    prisma.payment.findMany({ where: { folio: { reservation: { guestId: id } } }, select: { amount: true, kind: true, folio: { select: { reservationId: true } } } }),
  ]);
  const paid = new Map<string, number>();
  for (const p of pays) paid.set(p.folio.reservationId, (paid.get(p.folio.reservationId) ?? 0) + (p.kind === "REFUND" ? -p.amount : p.amount));
  const total = [...paid.values()].reduce((a, b) => a + b, 0);
  const past = res.filter(r => r.status === "CHECKED_OUT");
  const upcoming = res.filter(r => ["PENDING", "CONFIRMED"].includes(r.status)).length;

  let idMasked = "";
  if (g.idNumberEnc) { try { idMasked = maskId(decrypt(g.idNumberEnc)); } catch { idMasked = "(unreadable: check ID_ENCRYPTION_KEY)"; } }

  const stat = (l: string, v: string | number) => <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs text-slate-500">{l}</div><div className="mt-1 text-xl font-semibold">{v}</div></div>;
  return (<div className="space-y-5">
    <div><Link href="/guests" className="text-sm text-brand">← All guests</Link>{can(user.role, "guest.merge") && <Link href={`/guests/merge?keep=${g.id}`} className="ml-4 text-sm text-brand">Merge a duplicate into this profile</Link>}<h1 className="mt-1 text-2xl font-semibold">{g.fullName}</h1>
      <p className="text-sm text-slate-500">Guest since {g.createdAt.toLocaleDateString("en-PH", { month: "short", year: "numeric", timeZone: "Asia/Manila" })}</p></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stat("Previous stays", past.length)}{stat("Upcoming", upcoming)}{stat("Total spent", formatPHP(total))}{stat("Last stay", d(past[0]?.checkOut))}</div>
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="lg:col-span-2"><GuestEditor canEdit={can(user.role, "guest.edit")}
        g={{ id: g.id, fullName: g.fullName, phone: g.phone ?? "", email: g.email ?? "", address: g.address ?? "", nationality: g.nationality ?? "", notes: g.notes ?? "", idType: g.idType ?? "", idMasked }} /></div>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
        <h2 className="px-5 pt-4 font-semibold">Reservation history</h2>
        <table className="mt-2 w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
          {["Reservation", "Stay", "Room", "Status", "Paid"].map(h => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
          <tbody>{res.map(r => <tr key={r.id} className="border-t border-slate-100">
            <td className="px-4 py-2.5"><Link href={`/reservations/${r.id}`} className="text-brand">{r.code}</Link></td>
            <td className="px-4">{d(r.checkIn)} to {d(r.checkOut)}</td><td className="px-4">{r.room?.number ?? "—"}</td>
            <td className="px-4"><StatusBadge status={r.status} /></td><td className="px-4">{formatPHP(paid.get(r.id) ?? 0)}</td></tr>)}</tbody></table>
        {res.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No reservations yet.</p>}</section></div></div>);
}