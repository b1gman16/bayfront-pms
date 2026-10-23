import { PrismaClient } from "@prisma/client";
import { createInterface } from "readline/promises";

const prisma = new PrismaClient();
// Everything that holds guests, bookings, money and daily work. Staff, rooms, rates, settings and the audit log are kept.
const TABLES = ["Payment", "FolioItem", "Folio", "HousekeepingTask", "MaintenanceTicket", "Reservation", "Guest"];

async function main() {
  console.log("This will PERMANENTLY delete all guests, reservations, bills, payments, cleaning tasks and maintenance tickets:");
  for (const t of TABLES) {
    const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>(`SELECT COUNT(*) AS n FROM "${t}"`);
    console.log(`  ${t}: ${Number(rows[0].n)}`);
  }
  console.log("Kept: staff accounts, rooms, room types, room rates, tax and fee rules, settings, and the audit log.");
  console.log("Reservation numbers start again at BR-1001, and every room is set to Clean.");
  console.log("If any of this is real data, stop now and take a backup first.\n");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Type DELETE DEMO DATA to continue: ");
  rl.close();
  if (answer.trim() !== "DELETE DEMO DATA") { console.log("Cancelled. Nothing was changed."); return; }

  await prisma.$transaction([
    prisma.$executeRawUnsafe(`TRUNCATE ${TABLES.map(t => `"${t}"`).join(", ")} CASCADE`),
    prisma.$executeRawUnsafe(`UPDATE "Room" SET "status" = 'CLEAN'`),
  ]);
  console.log("Done. The system is now clear of guests and bookings.");
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());