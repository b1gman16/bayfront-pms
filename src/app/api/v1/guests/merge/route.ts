import { api } from "@/server/http";
import { mergeGuests } from "@/server/services/guestMerge";
export const POST = api("guest.merge", async (req, actor) => mergeGuests(await req.json(), actor));