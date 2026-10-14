import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";
import { prisma } from "./db";

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60_000;   // failures counted within this window
const LOCK_MS = 15 * 60_000;     // lock length

// Kept in memory: resets if the app restarts, and works for a single server like Bayfront's.
type Rec = { n: number; first: number; lockedUntil: number };
const g = globalThis as unknown as { __loginFails?: Map<string, Rec>; __dummyHash?: Promise<string> };
const fails = (g.__loginFails ??= new Map<string, Rec>());
const dummyHash = () => (g.__dummyHash ??= argon2.hash("not-a-real-password"));

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 3600 },        // one shift; re-login after
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    credentials: { email: {}, password: {} },
    async authorize(c) {
      const email = (c?.email ?? "").toLowerCase().trim();
      const now = Date.now();
      const rec = fails.get(email);
      if (rec && rec.lockedUntil > now) throw new Error("LOCKED");

      const u = await prisma.user.findUnique({ where: { email } });
      // Always do a password check, so unknown emails take about as long as real ones.
      const ok = await argon2.verify(u?.passwordHash ?? (await dummyHash()), c?.password ?? "");

      if (!u || !u.active || !ok) {
        const cur = rec && now - rec.first < WINDOW_MS ? rec : { n: 0, first: now, lockedUntil: 0 };
        cur.n += 1;
        if (cur.n >= MAX_FAILS) {
          cur.lockedUntil = now + LOCK_MS;
          if (u) await prisma.auditLog.create({ data: { userId: u.id, action: "login.locked", entity: "User", entityId: u.id,
            summary: `${u.name}'s account was locked for 15 minutes after ${MAX_FAILS} wrong passwords` } });
        }
        fails.set(email, cur);
        if (cur.lockedUntil > now) throw new Error("LOCKED");
        return null;
      }
      fails.delete(email);
      await prisma.user.update({ where: { id: u.id }, data: { lastLogin: new Date() } });
      return { id: u.id, name: u.name, email: u.email, role: u.role } as any;
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.role = (user as any).role; token.uid = user.id; } return token; },
    session({ session, token }) { (session.user as any).role = token.role; (session.user as any).id = token.uid; return session; },
  },
};