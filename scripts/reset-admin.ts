import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const pw = process.argv[2];
  if (!pw || pw.length < 8) throw new Error("Usage: npx tsx scripts/reset-admin.ts YourNewPassword (min 8 characters)");
  const hash = await argon2.hash(pw);
  await prisma.user.upsert({
    where: { email: "admin@bayfront.ph" },
    update: { passwordHash: hash, active: true, role: "OWNER" },
    create: { name: "Admin", email: "admin@bayfront.ph", passwordHash: hash, role: "OWNER" },
  });
  const u = await prisma.user.findUniqueOrThrow({ where: { email: "admin@bayfront.ph" } });
  const ok = await argon2.verify(u.passwordHash, pw);
  console.log(ok ? "OK: admin@bayfront.ph password is set and verified." : "FAILED: password did not verify.");
}
main().catch(e => { console.error(e.message); process.exit(1); }).finally(() => prisma.$disconnect());