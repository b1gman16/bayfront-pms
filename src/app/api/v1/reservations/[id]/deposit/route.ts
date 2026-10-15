import { api } from "@/server/http";
import { recordDeposit } from "@/server/services/deposits";
export const POST = api("payment.record", async (req, actor, { params }) => recordDeposit(params.id, await req.json(), actor));