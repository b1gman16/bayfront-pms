import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient({
  transactionOptions: { maxWait: 10_000, timeout: 30_000 },   // wait up to 10s for a connection, 30s per save
});
g.prisma = prisma;   // reuse one connection pool, in production too