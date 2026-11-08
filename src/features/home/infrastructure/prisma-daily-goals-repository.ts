import "server-only";

import type { DailyGoalsRepository } from "@/features/home/application/daily-goals-repository";
import { getPrismaClient } from "@/core/database/prisma";

export function createPrismaDailyGoalsRepository(
  userId: string,
): DailyGoalsRepository {
  const prisma = getPrismaClient();

  return {
    findSince(dateKey) {
      return prisma.dailyGoal.findMany({
        where: { userId, dateKey: { gte: dateKey } },
        orderBy: { dateKey: "asc" },
        select: { dateKey: true, goal: true },
      });
    },

    findToday(dateKey) {
      return prisma.dailyGoal.findUnique({
        where: { userId_dateKey: { userId, dateKey } },
        select: { dateKey: true, goal: true },
      });
    },

    async save(dateKey, goal) {
      await prisma.dailyGoal.upsert({
        where: { userId_dateKey: { userId, dateKey } },
        create: { userId, dateKey, goal },
        update: { goal },
        select: { id: true },
      });
    },
  };
}
