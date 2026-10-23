import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { findDuplicateGroups } from "@/server/domain/duplicates";
export const dynamic = "force-dynamic";

const WHY = { phone: "same phone number", email: "same email", name: "same name (may be two different people)" } as const;
const d = (x: Date) => x.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" });

export default async function Duplicates() {
  const user = (await getServerSession(authOptions))?.user as any;
  if (!can(user.role, "guest.merge")) notFound();
  const guests = await prisma.guest.findMany({ orderBy: { createdAt: "asc" }, take: 5000, select: { id: true, fullName: true, phone: true, email: true, createdAt: true } });
  const groups = findDuplicateGroups(guests);
  const counts = await prisma.reservation.groupBy({ by: ["guestId"], _count: true });
  const stays = (id: string) => counts.find(c => c.guestId === id)?._count ?? 0;

  return (<div className="space-y-4">
    <div><Link href="/guests" className="text-sm text-brand">← All guests</Link><h1 className="mt-1 text-2xl font-semibold">Possible duplicate guests</h1>
      <p className="text-sm text-slate-500">These profiles look like the same person. Check each pair before merging. A merge can't be undone.</p></div>
    {groups.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No duplicates found. To merge two profiles anyway, open a guest and use "Merge a duplicate into this profile".</p>}
    {groups.map(gr => {
      const sorted = [...gr.guests].sort((a, b) => stays(b.id) - stays(a.id) || +a.createdAt - +b.createdAt);
      const keeper = sorted[0];
      return (<section key={keeper.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-medium text-amber-700">Match: {gr.reasons.map(r => WHY[r]).join(", ")}</div>
        <ul className="divide-y divide-slate-100">{sorted.map(g => (<li key={g.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
          <div><Link href={`/guests/${g.id}`} className="font-medium hover:text-brand">{g.fullName}</Link>{g.id === keeper.id && <span className="ml-2 rounded bg-emerald-50 px-1.5 text-xs text-emerald-700">suggested to keep</span>}
            <div className="text-slate-500">{g.phone ?? "No phone"}{g.email ? ` · ${g.email}` : ""} · {stays(g.id)} reservation{stays(g.id) === 1 ? "" : "s"} · added {d(g.createdAt)}</div></div>
          {g.id !== keeper.id && <Link href={`/guests/merge?keep=${keeper.id}&remove=${g.id}`} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50">Compare and merge</Link>}</li>))}</ul>
      </section>);
    })}
  </div>);
}