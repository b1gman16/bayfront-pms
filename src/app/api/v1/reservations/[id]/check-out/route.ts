import { api } from "@/server/http";
import { checkOut } from "@/server/services/reservations";
export const POST = api("checkout", async (req, actor, { params }) => {
  const b = await req.json().catch(() => ({})); return checkOut(params.id, !!b.override, actor);
});
