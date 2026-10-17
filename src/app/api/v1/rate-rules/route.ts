import { api } from "@/server/http";
import { createRateRule } from "@/server/services/rateRules";
export const POST = api("rate.manage", async (req, actor) => createRateRule(await req.json(), actor));