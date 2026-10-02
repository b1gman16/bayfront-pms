import { api } from "@/server/http";
import { postCharge } from "@/server/services/frontdesk";
export const POST = api("folio.charge", async (req, actor, { params }) => postCharge(params.id, await req.json(), actor));