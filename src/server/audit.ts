import type { Prisma } from "@prisma/client";
// Takes the transaction client so the audit row commits or rolls back WITH the action.
export const audit = (tx: Prisma.TransactionClient, userId: string, action: string, entity: string,
  entityId: string, summary: string, before?: unknown, after?: unknown) =>
  tx.auditLog.create({ data: { userId, action, entity, entityId, summary,
    before: before as Prisma.InputJsonValue, after: after as Prisma.InputJsonValue } });
