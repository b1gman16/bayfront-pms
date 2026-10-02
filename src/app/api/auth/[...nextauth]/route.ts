import NextAuth from "next-auth";
import { authOptions } from "@/server/auth";
const h = NextAuth(authOptions);
export { h as GET, h as POST };
