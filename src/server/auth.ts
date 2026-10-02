import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 3600 },        // one shift; re-login after
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    credentials: { email: {}, password: {} },
    async authorize(c) {
      const u = await prisma.user.findUnique({ where: { email: (c?.email ?? "").toLowerCase() } });
      if (!u || !u.active || !(await argon2.verify(u.passwordHash, c?.password ?? ""))) return null;
      await prisma.user.update({ where: { id: u.id }, data: { lastLogin: new Date() } });
      return { id: u.id, name: u.name, email: u.email, role: u.role } as any;
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.role = (user as any).role; token.uid = user.id; } return token; },
    session({ session, token }) { (session.user as any).role = token.role; (session.user as any).id = token.uid; return session; },
  },
};
