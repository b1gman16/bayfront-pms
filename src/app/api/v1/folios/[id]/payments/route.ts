import { api } from "@/server/http";
import { recordPayment } from "@/server/services/reservations";
export const POST = api("payment.record", async (req, actor, { params }) => recordPayment(params.id, await req.json(), actor));
