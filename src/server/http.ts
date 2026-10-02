import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "./auth";
import { can, Role } from "./domain/permissions";

export class AppError extends Error {
  constructor(message: string, public status = 409, public data?: unknown) { super(message); }
}
export type Actor = { id: string; name: string; role: Role };

/** Every endpoint: authenticate -> authorize -> run -> uniform error handling. */
export function api(permission: string, fn: (req: Request, actor: Actor, ctx: any) => Promise<unknown>) {
  return async (req: Request, ctx: any) => {
    try {
      const u = (await getServerSession(authOptions))?.user as any;
      if (!u) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
      if (!can(u.role, permission)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
      const params = ctx?.params ? await ctx.params : {};   // Next 14 gives an object, Next 15+ a Promise
      return NextResponse.json(await fn(req, { id: u.id, name: u.name, role: u.role }, { ...ctx, params }));
    } catch (e: any) {
      if (e instanceof ZodError) return NextResponse.json({ error: "Invalid input", details: e.flatten() }, { status: 400 });
      if (e instanceof AppError) return NextResponse.json({ error: e.message, data: e.data }, { status: e.status });
      console.error(e);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}