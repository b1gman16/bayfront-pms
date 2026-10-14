import { z } from "zod";
import argon2 from "argon2";
import { randomInt } from "crypto";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";

const ROLES = ["OWNER", "MANAGER", "FRONT_DESK", "HOUSEKEEPING", "CASHIER"] as const;
const LABEL: Record<string, string> = { OWNER: "Owner", MANAGER: "Manager", FRONT_DESK: "Front Desk", HOUSEKEEPING: "Housekeeping", CASHIER: "Cashier" };
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // no look-alike characters
const tempPassword = () => Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/** Only an Owner may create, edit, or reset an Owner account, or promote someone to Owner. */
function guardOwner(actor: Actor, targetRole: string, newRole?: string) {
  if ((targetRole === "OWNER" || newRole === "OWNER") && actor.role !== "OWNER") throw new AppError("Only an Owner can manage Owner accounts", 403);
}

const createSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), role: z.enum(ROLES) });

export async function createUser(raw: unknown, actor: Actor) {
  const d = createSchema.parse(raw);
  guardOwner(actor, d.role);
  const pw = tempPassword();
  const passwordHash = await argon2.hash(pw);
  try {
    const u = await prisma.$transaction(async tx => {
      const u = await tx.user.create({ data: { name: d.name, email: d.email, role: d.role, passwordHash } });
      await audit(tx, actor.id, "user.create", "User", u.id, `${actor.name} created the ${LABEL[d.role]} account for ${d.name} (${d.email})`);
      return u;
    });
    return { id: u.id, tempPassword: pw };
  } catch (e: any) {
    if (e?.code === "P2002") throw new AppError("An account with that email already exists");
    throw e;
  }
}

const updateSchema = z.object({ name: z.string().trim().min(2).max(80), role: z.enum(ROLES), active: z.boolean() });

export async function updateUser(id: string, raw: unknown, actor: Actor) {
  const d = updateSchema.parse(raw);
  return prisma.$transaction(async tx => {
    const t = await tx.user.findUniqueOrThrow({ where: { id } });
    guardOwner(actor, t.role, d.role);
    if (id === actor.id && (d.role !== t.role || !d.active))
      throw new AppError("You can't change your own role or disable your own account. Ask another Owner.");
    if (t.role === "OWNER" && t.active && (d.role !== "OWNER" || !d.active)) {
      const others = await tx.user.count({ where: { role: "OWNER", active: true, id: { not: id } } });
      if (others === 0) throw new AppError("Bayfront needs at least one active Owner account");
    }
    await tx.user.update({ where: { id }, data: { name: d.name, role: d.role, active: d.active } });
    const parts: string[] = [];
    if (t.name !== d.name) parts.push(`name → ${d.name}`);
    if (t.role !== d.role) parts.push(`role ${LABEL[t.role]} → ${LABEL[d.role]}`);
    if (t.active !== d.active) parts.push(d.active ? "enabled" : "disabled");
    await audit(tx, actor.id, "user.update", "User", id, `${actor.name} updated ${t.name}'s account${parts.length ? ": " + parts.join(", ") : " (no changes)"}`);
    return { ok: true };
  });
}

export async function resetPassword(id: string, actor: Actor) {
  if (id === actor.id) throw new AppError("To change your own password, use Account → Change password");
  const pw = tempPassword();
  const passwordHash = await argon2.hash(pw);
  await prisma.$transaction(async tx => {
    const t = await tx.user.findUniqueOrThrow({ where: { id } });
    guardOwner(actor, t.role);
    await tx.user.update({ where: { id }, data: { passwordHash } });
    await audit(tx, actor.id, "user.password_reset", "User", id, `${actor.name} reset the password for ${t.name}`);
  });
  return { tempPassword: pw };
}

const pwSchema = z.object({ current: z.string().min(1), next: z.string().min(8, "At least 8 characters").max(100) });

export async function changeOwnPassword(raw: unknown, actor: Actor) {
  const d = pwSchema.parse(raw);
  const u = await prisma.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!(await argon2.verify(u.passwordHash, d.current))) throw new AppError("Your current password is wrong", 400);
  if (d.next === d.current) throw new AppError("Choose a different password than the current one", 400);
  const passwordHash = await argon2.hash(d.next);
  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: actor.id }, data: { passwordHash } });
    await audit(tx, actor.id, "user.password_change", "User", actor.id, `${actor.name} changed their own password`);
  });
  return { ok: true };
}