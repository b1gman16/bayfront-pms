import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function key(): Buffer {
  const h = process.env.ID_ENCRYPTION_KEY ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(h)) throw new Error("ID_ENCRYPTION_KEY must be 64 hex characters");
  return Buffer.from(h, "hex");
}

/** AES-256-GCM. Output is iv:authTag:data, each base64. */
export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map(b => b.toString("base64")).join(":");
}

export function decrypt(s: string): string {
  const [iv, tag, enc] = s.split(":").map(x => Buffer.from(x, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
}

export const maskId = (n: string) => (n.length <= 4 ? "••••" : "•••• " + n.slice(-4));