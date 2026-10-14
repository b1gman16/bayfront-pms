import { api } from "@/server/http";
import { updateTask } from "@/server/services/housekeeping";
export const PATCH = api("housekeeping.update", async (req, actor, { params }) => updateTask(params.id, await req.json(), actor));