import { api } from "@/server/http";
import { checkIn } from "@/server/services/reservations";
export const POST = api("checkin", async (req, actor, { params }) => {
  const b = await req.json(); return checkIn(params.id, Number(b.version), !!b.override, actor);
});
