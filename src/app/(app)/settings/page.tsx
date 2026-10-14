import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can, Role } from "@/server/domain/permissions";
import { AddStaff, EditStaff, ResetPassword } from "@/components/StaffUI";
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { OWNER: "Owner", MANAGER: "Manager", FRONT_DESK: "Front Desk", HOUSEKEEPING: "Housekeeping", CASHIER: "Cashier" };

export default async function Settings() {
  const s = (await getServerSession(authOptions))?.user as any;
  const me = await prisma.user.findUnique({ where: { id: s.id } });
  if (!me || !me.active || !can(me.role as Role, "user.manage")) notFound();
  const isOwner = me.role === "OWNER";
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (<div className="space-y-4">
    <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">Staff accounts</h1>
      <p className="text-sm text-slate-500">Who can sign in to Bayfront PMS, and what they can do.</p></div><AddStaff isOwner={isOwner} /></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-500"><tr>
        {["Name", "Email", "Role", "Status", "Last sign-in", ""].map((h, i) => <th key={i} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{users.map(u => {
          const self = u.id === me.id; const locked = u.role === "OWNER" && !isOwner;
          return (<tr key={u.id} className="border-t border-slate-100">
            <td className="px-4 py-3 font-medium">{u.name}{self && <span className="ml-2 rounded bg-slate-100 px-1.5 text-xs text-slate-500">You</span>}</td>
            <td className="px-4 text-slate-600">{u.email}</td><td className="px-4">{LABEL[u.role]}</td>
            <td className="px-4">{u.active ? <span className="text-emerald-700">Active</span> : <span className="text-red-600">Disabled</span>}</td>
            <td className="px-4 text-slate-500">{u.lastLogin ? u.lastLogin.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "Never"}</td>
            <td className="px-4 text-right">{!locked && <div className="flex justify-end gap-1">
              <EditStaff user={{ id: u.id, name: u.name, role: u.role, active: u.active }} isOwner={isOwner} self={self} />
              {!self && <ResetPassword id={u.id} name={u.name} />}</div>}</td></tr>);
        })}</tbody></table></div></div>);
}