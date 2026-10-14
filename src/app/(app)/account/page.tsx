import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { ChangePassword } from "@/components/StaffUI";
export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = { OWNER: "Owner", MANAGER: "Manager", FRONT_DESK: "Front Desk", HOUSEKEEPING: "Housekeeping", CASHIER: "Cashier" };

export default async function Account() {
  const s = (await getServerSession(authOptions))?.user as any;
  const me = await prisma.user.findUniqueOrThrow({ where: { id: s.id } });
  return (<div className="space-y-5"><h1 className="text-2xl font-semibold">My account</h1>
    <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
      <div className="text-lg font-semibold">{me.name}</div><div className="text-slate-500">{me.email}</div><div className="mt-1">{LABEL[me.role]}</div></div>
    <ChangePassword /></div>);
}