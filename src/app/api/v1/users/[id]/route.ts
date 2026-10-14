import { api } from "@/server/http";
import { updateUser } from "@/server/services/users";
export const PATCH = api("user.manage", async (req, actor, { params }) => updateUser(params.id, await req.json(), actor));