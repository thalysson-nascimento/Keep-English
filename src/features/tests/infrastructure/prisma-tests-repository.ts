import "server-only";

import type {
  StoredVocabularyTestResult,
  TestsRepository,
} from "@/features/tests/application/tests-repository";
import { getPrismaClient } from "@/core/database/prisma";

export function createPrismaTestsRepository(userId: string): TestsRepository {
  const prisma = getPrismaClient();

  return {
    findAll(): Promise<StoredVocabularyTestResult[]> {
      return prisma.vocabularyTest.findMany({
        where: { userId },
        orderBy: { completedAt: "desc" },
        select: { id: true, score: true, total: true, completedAt: true },
      });
    },

    async findLatestCompletion(): Promise<Date | null> {
      const test = await prisma.vocabularyTest.findFirst({
        where: { userId },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      });

      return test?.completedAt ?? null;
    },

    async findRewardForTest(completedAt, now) {
      const reward = await prisma.rewardedTestAccess.findFirst({
        where: {
          userId,
          forTestAt: completedAt,
          verifiedAt: { not: null },
          consumedAt: null,
          expiresAt: { gt: now },
        },
        select: { id: true },
      });
      return reward !== null;
    },

    async recordCompletion(result, rewardForTestAt): Promise<boolean> {
      return prisma.$transaction(async (transaction) => {
        if (rewardForTestAt) {
          const consumed = await transaction.rewardedTestAccess.updateMany({
            where: {
              userId,
              forTestAt: rewardForTestAt,
              verifiedAt: { not: null },
              consumedAt: null,
              expiresAt: { gt: result.completedAt },
            },
            data: { consumedAt: result.completedAt },
          });
          if (consumed.count !== 1) return false;
        }
        await transaction.vocabularyTest.create({
          data: { ...result, userId },
          select: { id: true },
        });
        return true;
      });
    },
  };
}
