import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { can } from "../domain/permissions";

import type { TicketStatus } from "@prisma/client";
const OPEN: TicketStatus[] = ["OPEN", "ASSIGNED", "IN_PROGRESS"];

const createSchema = z.object({
  roomId: z.string().optional(),
  area: z.string().trim().max(60).optional(),
  category: z.enum(["AIRCON", "PLUMBING", "ELECTRICAL", "INTERNET", "FURNITURE", "APPLIANCE", "OTHER"]),
  description: z.string().trim().min(3).max(500),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  blockRoom: z.boolean().default(false),
}).refine(d => d.roomId || d.area, { message: "Choose a room or describe the area", path: ["roomId"] });

export async function createTicket(raw: unknown, actor: Actor) {
  const d = createSchema.parse(raw);
  return prisma.$transaction(async tx => {
    const room = d.roomId ? await tx.room.findUniqueOrThrow({ where: { id: d.roomId } }) : null;
    let blocked = false; let warning: string | undefined;
    if (d.blockRoom && room) {
      if (!(can(actor.role, "maintenance.manage") || can(actor.role, "room.status")))
        throw new AppError("You can't take a room out of service. Ask the front desk or a manager.", 403);
      if (room.status === "OCCUPIED")
        throw new AppError(`Room ${room.number} has a guest in it. Report the problem without blocking the room, or move the guest first.`);
      await tx.room.update({ where: { id: room.id }, data: { status: "MAINTENANCE" } });
      blocked = true;
      const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
      const n = await tx.reservation.count({ where: { roomId: room.id, status: { in: ["PENDING", "CONFIRMED"] }, checkOut: { gt: today } } });
      if (n > 0) warning = `${n} upcoming reservation(s) still use Room ${room.number}. They need to be moved to another room.`;
    }
    const t = await tx.maintenanceTicket.create({ data: { roomId: room?.id, area: d.area || null, category: d.category,
      description: d.description, priority: d.priority, reportedById: actor.id } });
    await audit(tx, actor.id, "maintenance.create", "MaintenanceTicket", t.id,
      `${actor.name} reported a ${d.category.toLowerCase()} problem in ${room ? `Room ${room.number}` : d.area}${blocked ? " and blocked the room" : ""}`);
    return { ticket: t, warning };
  });
}

const updateSchema = z.object({
  action: z.enum(["ASSIGN", "START", "RESOLVE", "CLOSE", "REOPEN"]),
  assignedToId: z.string().nullable().optional(),
  resolution: z.string().trim().max(500).optional(),
});

export async function updateTicket(id: string, raw: unknown, actor: Actor) {
  const d = updateSchema.parse(raw);
  const mgr = can(actor.role, "maintenance.manage");
  return prisma.$transaction(async tx => {
    const t = await tx.maintenanceTicket.findUniqueOrThrow({ where: { id }, include: { room: true } });
    const where = t.room ? `Room ${t.room.number}` : t.area ?? "an area";
    const data: Record<string, unknown> = {};
    let summary = "";
    const mayWork = mgr || t.assignedToId === actor.id;

    switch (d.action) {
      case "ASSIGN": {
        if (!mgr) throw new AppError("Only a manager can assign tickets", 403);
        if (!OPEN.includes(t.status)) throw new AppError("This ticket is already resolved");
        const who = d.assignedToId ? await tx.user.findFirst({ where: { id: d.assignedToId, active: true } }) : null;
        if (d.assignedToId && !who) throw new AppError("That person can't be assigned", 400);
        data.assignedToId = who?.id ?? null;
        data.status = t.status === "IN_PROGRESS" ? "IN_PROGRESS" : who ? "ASSIGNED" : "OPEN";
        summary = `${actor.name} assigned the ${where} ticket to ${who?.name ?? "nobody"}`;
        break;
      }
      case "START":
        if (!OPEN.includes(t.status) || t.status === "IN_PROGRESS") throw new AppError("This ticket can't be started");
        if (!mayWork) throw new AppError("Only the assigned person or a manager can start this", 403);
        data.status = "IN_PROGRESS"; if (!t.assignedToId) data.assignedToId = actor.id;
        summary = `${actor.name} started work on the ${where} ticket`;
        break;
      case "RESOLVE":
        if (!OPEN.includes(t.status)) throw new AppError("This ticket is already resolved");
        if (!mayWork) throw new AppError("Only the assigned person or a manager can resolve this", 403);
        if (!d.resolution) throw new AppError("Describe what was done to fix it", 400);
        data.status = "RESOLVED"; data.resolution = d.resolution; data.resolvedAt = new Date();
        summary = `${actor.name} resolved the ${where} ticket: ${d.resolution}`;
        break;
      case "CLOSE":
        if (!mgr) throw new AppError("Only a manager can close tickets", 403);
        if (t.status !== "RESOLVED") throw new AppError("Only resolved tickets can be closed");
        data.status = "CLOSED"; summary = `${actor.name} closed the ${where} ticket`;
        break;
      case "REOPEN":
        if (!mgr) throw new AppError("Only a manager can reopen tickets", 403);
        if (!["RESOLVED", "CLOSED"].includes(t.status)) throw new AppError("This ticket is still open");
        data.status = "OPEN"; data.resolvedAt = null; summary = `${actor.name} reopened the ${where} ticket`;
        break;
    }

    // Atomic: only succeeds if nobody changed the ticket since we read it.
    const upd = await tx.maintenanceTicket.updateMany({ where: { id, status: t.status }, data: data as any });
    if (upd.count === 0) throw new AppError("Someone else just updated this ticket. Reload the page.");

    // Last open problem fixed on a blocked room: send it to housekeeping before it can be booked again.
    if (d.action === "RESOLVE" && t.room && t.room.status === "MAINTENANCE") {
      const others = await tx.maintenanceTicket.count({ where: { roomId: t.room.id, id: { not: id }, status: { in: OPEN } } });
      if (others === 0) {
        await tx.room.update({ where: { id: t.room.id }, data: { status: "DIRTY" } });
        await tx.housekeepingTask.create({ data: { roomId: t.room.id, status: "DIRTY", notes: "Cleaning after maintenance" } });
        summary += `. Room ${t.room.number} sent to housekeeping`;
      }
    }
    await audit(tx, actor.id, `maintenance.${d.action.toLowerCase()}`, "MaintenanceTicket", id, summary);
    return { ok: true };
  });
}