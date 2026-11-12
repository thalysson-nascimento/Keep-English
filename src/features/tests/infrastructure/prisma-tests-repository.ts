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

    async recordCompletion(result): Promise<void> {
      await prisma.vocabularyTest.create({
        data: { ...result, userId },
        select: { id: true },
      });
    },
  };
}
