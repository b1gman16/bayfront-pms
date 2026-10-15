import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Pages require login. The path is passed on so the layout can check page permissions.
export default withAuth(
  function middleware(req) {
    const h = new Headers(req.headers);
    h.set("x-pathname", req.nextUrl.pathname);
    return NextResponse.next({ request: { headers: h } });
  },
  { pages: { signIn: "/login" } },
);
export const config = { matcher: ["/((?!login|api|_next|favicon).*)"] };