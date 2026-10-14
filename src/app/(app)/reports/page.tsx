import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import { REPORTS } from "@/server/services/reports";
export const dynamic = "force-dynamic";

export default async function Reports() {
  const user = (await getServerSession(authOptions))?.user as any;
  const allowed = REPORTS.filter(r => can(user.role, r.perm));
  if (allowed.length === 0) notFound();
  const groups = [...new Set(allowed.map(r => r.group))];
  return (<div className="space-y-6"><div><h1 className="text-2xl font-semibold">Reports</h1><p className="text-sm text-slate-500">Pick a report, choose the dates, then export or print it.</p></div>
    {groups.map(g => (<section key={g} className="space-y-3"><h2 className="font-semibold">{g}</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{allowed.filter(r => r.group === g).map(r => (
        <Link key={r.key} href={`/reports/${r.key}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand">
          <div className="font-medium">{r.title}</div><div className="mt-1 text-sm text-slate-500">{r.desc}</div></Link>))}</div></section>))}</div>);
}