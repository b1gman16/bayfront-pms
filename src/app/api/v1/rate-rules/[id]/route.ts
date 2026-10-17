import { api } from "@/server/http";
import { updateRateRule } from "@/server/services/rateRules";
export const PATCH = api("rate.manage", async (req, actor, { params }) => updateRateRule(params.id, await req.json(), actor));