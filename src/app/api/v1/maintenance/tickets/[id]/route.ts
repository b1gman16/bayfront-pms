import { api } from "@/server/http";
import { updateTicket } from "@/server/services/maintenance";
export const PATCH = api("maintenance.report", async (req, actor, { params }) => updateTicket(params.id, await req.json(), actor));