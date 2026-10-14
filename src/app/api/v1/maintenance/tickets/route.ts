import { api } from "@/server/http";
import { createTicket } from "@/server/services/maintenance";
export const POST = api("maintenance.report", async (req, actor) => createTicket(await req.json(), actor));