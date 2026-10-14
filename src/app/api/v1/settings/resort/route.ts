import { api } from "@/server/http";
import { saveResort } from "@/server/services/settings";
export const PUT = api("rate.manage", async (req, actor) => saveResort(await req.json(), actor));