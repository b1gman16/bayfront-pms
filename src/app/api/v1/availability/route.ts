import { api } from "@/server/http";
import { prisma } from "@/server/db";
import { findAvailableRooms } from "@/server/domain/availability";
export const GET = api("room.view", async (req) => {
  const u = new URL(req.url); const from = new Date(u.searchParams.get("from")!), to = new Date(u.searchParams.get("to")!);
  const [rooms, stays] = await Promise.all([prisma.room.findMany(), prisma.reservation.findMany({ where: { roomId: { not: null } } })]);
  return findAvailableRooms(rooms, stays, from, to, u.searchParams.get("roomTypeId") ?? undefined);
});
