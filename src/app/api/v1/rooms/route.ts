import { api } from "@/server/http";
import { createRoom } from "@/server/services/rooms";
export const POST = api("room.manage", async (req, actor) => createRoom(await req.json(), actor));