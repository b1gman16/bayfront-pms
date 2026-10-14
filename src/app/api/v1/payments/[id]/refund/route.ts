import { api } from "@/server/http";
import { refundPayment } from "@/server/services/billing";
export const POST = api("payment.refund", async (req, actor, { params }) => refundPayment(params.id, await req.json(), actor));