import { api } from "@/server/http";
import { updateRoom } from "@/server/services/rooms";
export const PATCH = api("room.manage", async (req, actor, { params }) => updateRoom(params.id, await req.json(), actor));