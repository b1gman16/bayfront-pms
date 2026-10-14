import { api } from "@/server/http";
import { searchGuests, createGuest } from "@/server/services/frontdesk";
export const GET = api("guest.view", async (req) => searchGuests(new URL(req.url).searchParams.get("q") ?? ""));
export const POST = api("guest.edit", async (req, actor) => createGuest(await req.json(), actor));