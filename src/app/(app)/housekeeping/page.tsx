import { getServerSession } from "next-auth";
import { prisma } from "@/server/db";
import { authOptions } from "@/server/auth";
import { can } from "@/server/domain/permissions";
import HousekeepingCard from "@/components/HousekeepingCard";
export const dynamic = "force-dynamic";

const COLUMNS = [
  ["To clean", "DIRTY", "No rooms waiting to be cleaned."],
  ["Being cleaned", "CLEANING", "No rooms are being cleaned."],
  ["Clean, awaiting inspection", "CLEAN", "Nothing finished today yet."],
] as const;

export default async function Housekeeping() {
  const user = (await getServerSession(authOptions))?.user as any;
  const canManage = can(user.role, "housekeeping.manage");
  const mineOnly = user.role === "HOUSEKEEPING";
  // Midnight today in Manila (UTC+8), as a UTC instant.
  const since = new Date(new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) + "T00:00:00.000Z").getTime() - 8 * 3600e3);

  const where: any = { AND: [
    { OR: [{ status: { in: ["DIRTY", "CLEANING"] } }, { status: "CLEAN", completedAt: { gte: since } }] },
    ...(mineOnly ? [{ OR: [{ assignedToId: user.id }, { assignedToId: null }] }] : []),
  ] };
  const [tasks, staff] = await Promise.all([
    prisma.housekeepingTask.findMany({ where, include: { room: { include: { roomType: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.user.findMany({ where: { role: "HOUSEKEEPING", active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (<div className="space-y-5">
    <div><h1 className="text-2xl font-semibold">Housekeeping</h1>
      <p className="text-sm text-slate-500">{mineOnly ? "Your rooms and unassigned rooms." : "All cleaning tasks."} Rooms become bookable when marked clean.</p></div>
    <div className="grid gap-5 lg:grid-cols-3">
      {COLUMNS.map(([title, status, empty]) => {
        const list = tasks.filter(t => t.status === status);
        return (<section key={status} aria-label={title} className="space-y-3">
          <h2 className="flex items-center justify-between font-semibold">{title}<span className="rounded-full bg-slate-200 px-2 text-xs">{list.length}</span></h2>
          {list.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">{empty}</p>
            : list.map(t => <HousekeepingCard key={t.id} id={t.id} status={t.status} room={t.room.number} type={t.room.roomType.name}
                notes={t.notes ?? ""} assignedToId={t.assignedToId ?? ""} staff={staff} canManage={canManage} />)}
        </section>);
      })}
    </div></div>);
}