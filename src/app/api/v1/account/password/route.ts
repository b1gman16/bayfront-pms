import { api } from "@/server/http";
import { changeOwnPassword } from "@/server/services/users";
export const POST = api("", async (req, actor) => changeOwnPassword(await req.json(), actor));