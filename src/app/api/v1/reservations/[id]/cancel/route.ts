import { api } from "@/server/http";
import { cancelReservation } from "@/server/services/changes";
export const POST = api("reservation.cancel", async (req, actor, { params }) => cancelReservation(params.id, await req.json(), actor));