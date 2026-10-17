import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { AddGuest } from "@/components/GuestUI";
export const dynamic = "force-dynamic";

const PAGE = 25;
const d = (x?: Date | null) => (x ? x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—");

export default async function Guests(props: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "guest.view")) notFound();
  const q = sp.q?.trim() || undefined; const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" as const } }] } : {};

  const [guests, total] = await Promise.all([
    prisma.guest.findMany({ where, orderBy: { fullName: "asc" }, take: PAGE, skip: (page - 1) * PAGE }),
    prisma.guest.count({ where }),
  ]);
  const ids = guests.map(g => g.id);
  const [stays, pays] = await Promise.all([
    prisma.reservation.groupBy({ by: ["guestId"], where: { guestId: { in: ids }, status: "CHECKED_OUT" }, _count: true, _max: { checkOut: true } }),
    prisma.payment.findMany({ where: { folio: { reservation: { guestId: { in: ids } } } },
      select: { amount: true, kind: true, folio: { select: { reservation: { select: { guestId: true } } } } } }),
  ]);
  const spent = new Map<string, number>();
  for (const p of pays) { const id = p.folio.reservation.guestId; spent.set(id, (spent.get(id) ?? 0) + (p.kind === "REFUND" ? -p.amount : p.amount)); }
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (p: number) => `/guests?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${p}`;
  const stat = (id: string) => stays.find(x => x.guestId === id);

  return (<div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><h1 className="text-2xl font-semibold">Guests</h1>{can(user.role, "guest.edit") && <AddGuest />}</div>
    <form method="get" className="flex gap-2"><input name="q" defaultValue={q ?? ""} aria-label="Search guests" placeholder="Search by name, phone or email…"
      className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm" /><button className="rounded-md bg-navy-800 px-4 py-2 text-sm text-white">Search</button>
      {q && <Link href="/guests" className="self-center text-sm text-brand">Clear</Link>}</form>
    <p className="text-sm text-slate-500">{total.toLocaleString("en-PH")} guest{total === 1 ? "" : "s"}{q ? " found" : ""}.</p>

    <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Name", "Phone", "Email", "Previous stays", "Total spent", "Last stay"].map(h => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{guests.map(g => { const s = stat(g.id);
          return (<tr key={g.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium"><Link href={`/guests/${g.id}`} className="hover:text-brand">{g.fullName}</Link></td>
            <td className="px-4">{g.phone ?? "—"}</td><td className="px-4 text-slate-600">{g.email ?? "—"}</td>
            <td className="px-4">{s?._count ?? 0}</td><td className="px-4">{formatPHP(spent.get(g.id) ?? 0)}</td><td className="px-4">{d(s?._max.checkOut)}</td></tr>); })}</tbody></table>
      {guests.length === 0 && <p className="p-8 text-center text-sm text-slate-500">{q ? "No guests match that search." : "No guests yet. They are added when you make a reservation."}</p>}</div>

    <div className="space-y-2 md:hidden">
      {guests.map(g => { const s = stat(g.id);
        return (<Link key={g.id} href={`/guests/${g.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50">
          <div className="font-semibold">{g.fullName}</div>
          <div className="text-sm text-slate-500">{g.phone ?? "No phone"}{g.email ? ` · ${g.email}` : ""}</div>
          <div className="mt-1 text-sm">{s?._count ?? 0} stay{(s?._count ?? 0) === 1 ? "" : "s"} · {formatPHP(spent.get(g.id) ?? 0)} spent · last {d(s?._max.checkOut)}</div></Link>); })}
      {guests.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{q ? "No guests match that search." : "No guests yet."}</p>}</div>

    {pages > 1 && <div className="flex items-center justify-between text-sm">
      {page > 1 ? <Link href={link(page - 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">← Previous</Link> : <span />}
      <span className="text-slate-500">Page {page} of {pages}</span>
      {page < pages ? <Link href={link(page + 1)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">Next →</Link> : <span />}</div>}
  </div>);
}