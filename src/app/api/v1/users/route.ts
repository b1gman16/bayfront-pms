import { api } from "@/server/http";
import { createUser } from "@/server/services/users";
export const POST = api("user.manage", async (req, actor) => createUser(await req.json(), actor));