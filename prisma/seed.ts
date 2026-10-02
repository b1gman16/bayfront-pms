import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { randomBytes } from "crypto";
const prisma = new PrismaClient();
const peso = (p: number) => p * 100;

async function main() {
  const pw = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
  await prisma.user.upsert({ where: { email: "admin@bayfront.ph" }, update: {},
    create: { name: "Admin", email: "admin@bayfront.ph", passwordHash: await argon2.hash(pw), role: "OWNER" } });
  console.log(`Admin: admin@bayfront.ph / ${pw}  (change after first login)`);

  const types = [["Standard Room", 2500, 2], ["Deluxe Room", 3800, 3], ["Family Room", 5200, 5], ["Suite", 7500, 4]] as const;
  const t: Record<string, string> = {};
  for (const [name, rate, max] of types) {
    t[name] = (await prisma.roomType.upsert({ where: { name }, update: {}, create: { name, baseRate: peso(rate), maxOccupancy: max } })).id;
  }
  const rooms: [string, string, string][] = [["101", "Standard Room", "1"], ["102", "Standard Room", "1"],
    ["201", "Deluxe Room", "2"], ["202", "Deluxe Room", "2"], ["203", "Family Room", "2"], ["301", "Suite", "3"]];
  for (const [number, type, floor] of rooms) {
    const rt = types.find(x => x[0] === type)!;
    await prisma.room.upsert({ where: { number }, update: {}, create: { number, roomTypeId: t[type], floor, maxOccupancy: rt[2], status: "CLEAN", amenities: ["Aircon", "WiFi", "Hot shower"] } });
  }
  // Editable in Settings later. These are examples only: replace with the resort's actual rules.
  if ((await prisma.feeRule.count()) === 0) await prisma.feeRule.createMany({ data: [
    { name: "Service Charge", kind: "FEE", type: "PERCENT", value: 1000, sortOrder: 1, active: false },
    { name: "VAT", kind: "TAX", type: "PERCENT", value: 1200, sortOrder: 2, active: false } ] });
  if ((await prisma.guest.count()) === 0) await prisma.guest.createMany({ data: [
    { fullName: "Maria Santos", phone: "0917 123 4567", email: "maria.santos@example.com", nationality: "Filipino" },
    { fullName: "Juan Dela Cruz", phone: "0920 555 0101", nationality: "Filipino" },
    { fullName: "Angelica Reyes", phone: "0998 222 3344", email: "angel.reyes@example.com", nationality: "Filipino" } ] });
}
main().finally(() => prisma.$disconnect());
