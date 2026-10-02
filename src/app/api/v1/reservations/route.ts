import { api } from "@/server/http";
import { createReservation } from "@/server/services/reservations";
export const POST = api("reservation.create", async (req, actor) => createReservation(await req.json(), actor));
