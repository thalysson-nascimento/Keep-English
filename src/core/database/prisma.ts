import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL must be set before using Prisma.");
  }

  const adapter = new PrismaPg({ connectionString: url, max: 1 });
  globalForPrisma.prisma = new PrismaClient({ adapter });

  return globalForPrisma.prisma;
}
