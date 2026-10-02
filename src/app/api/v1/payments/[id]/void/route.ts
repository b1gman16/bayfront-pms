import { api } from "@/server/http";
import { voidItem } from "@/server/services/billing";
export const POST = api("folio.void", async (req, actor, { params }) => voidItem(params.id, await req.json(), actor));