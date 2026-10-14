import { api } from "@/server/http";
import { updateRule } from "@/server/services/settings";
export const PATCH = api("rate.manage", async (req, actor, { params }) => updateRule(params.id, await req.json(), actor));