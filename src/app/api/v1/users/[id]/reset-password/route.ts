import { api } from "@/server/http";
import { resetPassword } from "@/server/services/users";
export const POST = api("user.manage", async (_req, actor, { params }) => resetPassword(params.id, actor));