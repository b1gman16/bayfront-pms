import { api } from "@/server/http";
import { updateReservation } from "@/server/services/changes";
export const PATCH = api("reservation.edit", async (req, actor, { params }) => updateReservation(params.id, await req.json(), actor));