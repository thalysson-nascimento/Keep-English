import "server-only";

import { getPrismaClient } from "@/core/database/prisma";
import type { RankingRepository } from "@/features/ranking/application/ranking-repository";

export function createPrismaRankingRepository(): RankingRepository {
  const prisma = getPrismaClient();

  return {
    findUsers() {
      return prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, avatar: true },
      });
    },

    findWordsCreatedSince(date) {
      return prisma.word.findMany({
        where: { createdAt: { gte: date }, userId: { not: null } },
        select: { userId: true, createdAt: true },
      });
    },

    findTestsCompletedSince(date) {
      return prisma.vocabularyTest.findMany({
        where: { completedAt: { gte: date }, userId: { not: null } },
        select: { userId: true, score: true, completedAt: true },
      });
    },
  };
}
