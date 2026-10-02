import { prisma } from "@/server/db";
import NewReservationForm from "@/components/NewReservationForm";
export const dynamic = "force-dynamic";
export default async function NewReservation() {
  const t = await prisma.roomType.findMany({ where: { active: true }, orderBy: { baseRate: "asc" } });
  return (<div className="space-y-4"><h1 className="text-2xl font-semibold">New reservation</h1>
    <NewReservationForm types={t.map(x => ({ id: x.id, name: x.name, ratePesos: x.baseRate / 100, maxOccupancy: x.maxOccupancy }))} /></div>);
}