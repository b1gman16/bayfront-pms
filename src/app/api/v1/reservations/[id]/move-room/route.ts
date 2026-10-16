import { api } from "@/server/http";
import { moveRoom } from "@/server/services/moves";
export const POST = api("reservation.edit", async (req, actor, { params }) => moveRoom(params.id, await req.json(), actor));