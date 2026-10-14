import { api } from "@/server/http";
import { createRule } from "@/server/services/settings";
export const POST = api("rate.manage", async (req, actor) => createRule(await req.json(), actor));