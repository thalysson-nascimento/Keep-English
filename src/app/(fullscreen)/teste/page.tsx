import { Suspense } from "react";
import { connection } from "next/server";
import { getTestAccessData } from "@/features/tests/application/get-test-access-data";
import { createVocabularyQuestions } from "@/features/tests/domain/vocabulary-test";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import {
  VocabularyTestScreen,
  VocabularyTestSkeleton,
} from "@/features/tests/presentation/vocabulary-test-screen";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { requireCurrentUserId } from "@/core/auth/session";

async function TestContent() {
  await connection();
  const userId = await requireCurrentUserId();
  const data = await getTestAccessData(
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
    createPrismaTestsRepository(userId),
  );

  return (
    <VocabularyTestScreen
      data={{
        ...data,
        questions: createVocabularyQuestions(data.words),
      }}
    />
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={<VocabularyTestSkeleton />}>
      <TestContent />
    </Suspense>
  );
}
