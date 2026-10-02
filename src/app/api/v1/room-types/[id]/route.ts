import { api } from "@/server/http";
import { updateRoomType } from "@/server/services/rooms";
export const PATCH = api("room.manage", async (req, actor, { params }) => updateRoomType(params.id, await req.json(), actor));