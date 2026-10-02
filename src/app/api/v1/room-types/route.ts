import { api } from "@/server/http";
import { createRoomType } from "@/server/services/rooms";
export const POST = api("room.manage", async (req, actor) => createRoomType(await req.json(), actor));