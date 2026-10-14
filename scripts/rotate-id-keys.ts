import { PrismaClient } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const prisma = new PrismaClient();
const hex = (name: string) => {
  const v = process.env[name] ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(v)) throw new Error(`${name} must be 64 hex characters`);
  return Buffer.from(v, "hex");
};
const oldKey = hex("OLD_ID_KEY"), newKey = hex("NEW_ID_KEY");

function dec(s: string) {
  const [iv, tag, data] = s.split(":").map(x => Buffer.from(x, "base64"));
  const d = createDecipheriv("aes-256-gcm", oldKey, iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}
function enc(t: string) {
  const iv = randomBytes(12); const c = createCipheriv("aes-256-gcm", newKey, iv);
  const data = Buffer.concat([c.update(t, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map(b => b.toString("base64")).join(":");
}

async function main() {
  const guests = await prisma.guest.findMany({ where: { idNumberEnc: { not: null } }, select: { id: true, idNumberEnc: true } });
  const updates = guests.map(g => prisma.guest.update({ where: { id: g.id }, data: { idNumberEnc: enc(dec(g.idNumberEnc!)) } }));
  await prisma.$transaction(updates);   // all or nothing
  console.log(`Re-encrypted ${guests.length} ID number(s) with the new key.`);
}
main().catch(e => { console.error("FAILED:", e.message); process.exit(1); }).finally(() => prisma.$disconnect());