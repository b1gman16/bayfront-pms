import { api } from "@/server/http";
import { markNoShow } from "@/server/services/changes";
export const POST = api("reservation.edit", async (req, actor, { params }) => markNoShow(params.id, Number((await req.json()).version), actor));