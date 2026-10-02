import { z } from "zod";
import { prisma } from "../db";
import { audit } from "../audit";
import { AppError, Actor } from "../http";
import { can } from "../domain/permissions";

const schema = z.object({
  action: z.enum(["ASSIGN", "START", "FINISH", "INSPECT", "NOTE"]),
  assignedToId: z.string().nullable().optional(),
  notes: z.string().trim().max(300).optional(),
});

/** One cleaning-task step. Task and room change together or not at all. */
export async function updateTask(id: string, raw: unknown, actor: Actor) {
  const d = schema.parse(raw);
  return prisma.$transaction(async tx => {
    const t = await tx.housekeepingTask.findUniqueOrThrow({ where: { id }, include: { room: true } });
    const num = t.room.number;
    const data: Record<string, unknown> = {};
    let roomStatus: "CLEANING" | "CLEAN" | "INSPECTED" | undefined;
    let summary = "";

    switch (d.action) {
      case "ASSIGN": {
        if (!can(actor.role, "housekeeping.manage")) throw new AppError("Only a supervisor can assign tasks", 403);
        if (!["DIRTY", "CLEANING"].includes(t.status)) throw new AppError("This task is already finished");
        const who = d.assignedToId ? await tx.user.findFirst({ where: { id: d.assignedToId, active: true, role: "HOUSEKEEPING" } }) : null;
        if (d.assignedToId && !who) throw new AppError("That staff member can't be assigned", 400);
        data.assignedToId = who?.id ?? null;
        summary = `${actor.name} assigned Room ${num} cleaning to ${who?.name ?? "nobody"}`;
        break;
      }
      case "START":
        if (t.status !== "DIRTY") throw new AppError(`Room ${num} cleaning has already started`);
        if (t.room.status !== "DIRTY") throw new AppError(`Room ${num} is ${t.room.status.toLowerCase().replace("_", " ")}, so it can't be cleaned right now`);
        data.status = "CLEANING"; data.startedAt = new Date();
        if (!t.assignedToId && actor.role === "HOUSEKEEPING") data.assignedToId = actor.id;
        roomStatus = "CLEANING";
        summary = `${actor.name} started cleaning Room ${num}`;
        break;
      case "FINISH":
        if (t.status !== "CLEANING") throw new AppError("Start cleaning before marking the room clean");
        if (t.room.status !== "CLEANING") throw new AppError(`Room ${num} changed to ${t.room.status.toLowerCase().replace("_", " ")} meanwhile. Ask a supervisor.`);
        data.status = "CLEAN"; data.completedAt = new Date();
        roomStatus = "CLEAN";
        summary = `${actor.name} marked Room ${num} clean`;
        break;
      case "INSPECT":
        if (!can(actor.role, "housekeeping.manage")) throw new AppError("Only a supervisor can inspect rooms", 403);
        if (t.status !== "CLEAN") throw new AppError("Only clean rooms can be inspected");
        if (t.room.status !== "CLEAN") throw new AppError(`Room ${num} changed to ${t.room.status.toLowerCase().replace("_", " ")} meanwhile`);
        data.status = "INSPECTED"; data.inspectedById = actor.id;
        roomStatus = "INSPECTED";
        summary = `${actor.name} inspected Room ${num}`;
        break;
      case "NOTE":
        if (d.notes === undefined) throw new AppError("Write a note first", 400);
        summary = `${actor.name} updated the cleaning note for Room ${num}`;
        break;
    }
    if (d.notes !== undefined) data.notes = d.notes || null;

    // Atomic: only succeeds if nobody else changed the task since we read it.
    const upd = await tx.housekeepingTask.updateMany({ where: { id, status: t.status }, data: data as any });
    if (upd.count === 0) throw new AppError("Someone else just updated this task. Reload the page.");
    if (roomStatus) await tx.room.update({ where: { id: t.roomId }, data: { status: roomStatus } });
    await audit(tx, actor.id, `housekeeping.${d.action.toLowerCase()}`, "HousekeepingTask", id, summary);
    return { ok: true };
  });
}