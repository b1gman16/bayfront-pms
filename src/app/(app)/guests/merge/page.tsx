import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { formatPHP } from "@/server/domain/folio";
import { decrypt, maskId } from "@/server/crypto";
import MergeGuest from "@/components/MergeGuest";
export const dynamic = "force-dynamic";

const d = (x: Date) => x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });

async function summary(guestId: string) {
  const [byStatus, pays] = await Promise.all([
    prisma.reservation.groupBy({ by: ["status"], where: { guestId }, _count: true }),
    prisma.payment.groupBy({ by: ["kind"], where: { folio: { reservation: { guestId } } }, _sum: { amount: true } }),
  ]);
  const n = (...s: string[]) => byStatus.filter(x => s.includes(x.status)).reduce((a, x) => a + x._count, 0);
  const paid = (pays.find(p => p.kind === "PAYMENT")?._sum.amount ?? 0) - (pays.find(p => p.kind === "REFUND")?._sum.amount ?? 0);
  return { total: byStatus.reduce((a, x) => a + x._count, 0), past: n("CHECKED_OUT"), active: n("PENDING", "CONFIRMED", "CHECKED_IN"), paid };
}

function idText(g: { idType: string | null; idNumberEnc: string | null }) {
  if (!g.idNumberEnc) return g.idType ? `${g.idType}, no number` : "—";
  try { return `${g.idType ?? "ID"} ${maskId(decrypt(g.idNumberEnc))}`; } catch { return "(unreadable)"; }
}

export default async function MergePage(props: { searchParams: Promise<{ keep?: string; remove?: string; q?: string }> }) {
  const sp = await props.searchParams;
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "guest.merge") || !sp.keep) notFound();
  const keep = await prisma.guest.findUnique({ where: { id: sp.keep } });
  if (!keep) notFound();

  // Step 1: choose the other profile.
  if (!sp.remove) {
    const q = sp.q?.trim();
    const found = q ? await prisma.guest.findMany({ where: { id: { not: keep.id }, OR: [
      { fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }] }, orderBy: { fullName: "asc" }, take: 10 }) : [];
    return (<div className="max-w-xl space-y-4">
      <div><Link href={`/guests/${keep.id}`} className="text-sm text-brand">← Back to {keep.fullName}</Link>
        <h1 className="mt-1 text-2xl font-semibold">Merge a duplicate into {keep.fullName}</h1><p className="text-sm text-slate-500">Search for the other profile for the same person.</p></div>
      <form method="get" className="flex gap-2"><input type="hidden" name="keep" value={keep.id} />
        <input name="q" defaultValue={q ?? ""} autoFocus aria-label="Search guests" placeholder="Name, phone or email…" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-md bg-navy-800 px-4 py-2 text-sm text-white">Search</button></form>
      {q && found.length === 0 && <p className="text-sm text-slate-500">No other guests match.</p>}
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">{found.map(g => (
        <li key={g.id} className="flex items-center justify-between gap-3 p-3 text-sm"><div><div className="font-medium">{g.fullName}</div><div className="text-slate-500">{g.phone ?? "No phone"}{g.email ? ` · ${g.email}` : ""}</div></div>
          <Link href={`/guests/merge?keep=${keep.id}&remove=${g.id}`} className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Compare</Link></li>))}</ul>
    </div>);
  }

  // Step 2: compare and confirm.
  const rem = await prisma.guest.findUnique({ where: { id: sp.remove } });
  if (!rem || rem.id === keep.id) notFound();
  const [a, b] = await Promise.all([summary(keep.id), summary(rem.id)]);
  const rows: [string, string, string][] = [
    ["Name", keep.fullName, rem.fullName], ["Phone", keep.phone ?? "—", rem.phone ?? "—"], ["Email", keep.email ?? "—", rem.email ?? "—"],
    ["Address", keep.address ?? "—", rem.address ?? "—"], ["Nationality", keep.nationality ?? "—", rem.nationality ?? "—"],
    ["ID", idText(keep), idText(rem)], ["Notes", keep.notes ?? "—", rem.notes ?? "—"],
    ["Reservations", String(a.total), String(b.total)], ["Previous stays", String(a.past), String(b.past)], ["Upcoming or in house", String(a.active), String(b.active)],
    ["Total paid", formatPHP(a.paid), formatPHP(b.paid)], ["Profile added", d(keep.createdAt), d(rem.createdAt)],
  ];
  return (<div className="max-w-3xl space-y-4">
    <div><Link href="/guests/duplicates" className="text-sm text-brand">← Possible duplicates</Link><h1 className="mt-1 text-2xl font-semibold">Merge guest profiles</h1></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs"><tr><th className="px-4 py-3" />
        <th className="px-4 py-3 font-medium text-emerald-700">Kept profile</th><th className="px-4 py-3 font-medium text-red-700">Will be removed</th></tr></thead>
        <tbody>{rows.map(([l, x, y]) => (<tr key={l} className="border-t border-slate-100 align-top"><th className="px-4 py-2.5 text-left font-medium text-slate-500">{l}</th>
          <td className="whitespace-pre-line px-4 py-2.5">{x}</td><td className="whitespace-pre-line px-4 py-2.5">{y}</td></tr>))}</tbody></table></div>
    <Link href={`/guests/merge?keep=${rem.id}&remove=${keep.id}`} className="inline-block text-sm text-brand">⇄ Keep {rem.fullName} instead</Link>
    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">All reservations, bills and payments move to the kept profile. Blank details on the kept profile (phone, email, address, nationality, ID) are filled in from the removed one, and the notes are combined.</p>
    <MergeGuest keepId={keep.id} removeId={rem.id} keepName={keep.fullName} removeName={rem.fullName} reservations={b.total} />
  </div>);
}