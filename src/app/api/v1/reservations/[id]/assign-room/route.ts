import { api } from "@/server/http";
import { assignRoom } from "@/server/services/frontdesk";
export const POST = api("reservation.edit", async (req, actor, { params }) => assignRoom(params.id, (await req.json()).roomId, actor));