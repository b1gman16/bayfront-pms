import { withAuth } from "next-auth/middleware";

// Pages require login; /api routes check the session themselves.
export default withAuth({ pages: { signIn: "/login" } });
export const config = { matcher: ["/((?!login|api|_next|favicon).*)"] };