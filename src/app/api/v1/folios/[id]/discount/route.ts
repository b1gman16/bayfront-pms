import { api } from "@/server/http";
import { addDiscount } from "@/server/services/discounts";
export const POST = api("folio.discount", async (req, actor, { params }) => addDiscount(params.id, await req.json(), actor));