import { api } from "@/server/http";
import { updateGuest } from "@/server/services/guests";
export const PATCH = api("guest.edit", async (req, actor, { params }) => updateGuest(params.id, await req.json(), actor));