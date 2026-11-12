"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { getTestAccessData } from "@/features/tests/application/get-test-access-data";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import {
  getTestLockReason,
  maxVocabularyTestQuestionCount,
  normalizeAnswer,
} from "@/features/tests/domain/vocabulary-test";
import { requireCurrentUserId } from "@/core/auth/session";

const answersSchema = z
  .array(
    z.object({
      wordId: z.string().cuid(),
      answer: z.string().trim().min(1).max(100),
    }),
  )
  .min(1)
  .max(maxVocabularyTestQuestionCount);

export async function completeVocabularyTestAction(input: unknown) {
  const parsedInput = answersSchema.safeParse(input);

  if (!parsedInput.success) {
    return { status: "invalid" as const };
  }

  const userId = await requireCurrentUserId();
  const now = new Date();
  const wordsRepository = createPrismaWordsRepository(userId);
  const goalsRepository = createPrismaDailyGoalsRepository(userId);
  const testsRepository = createPrismaTestsRepository(userId);
  const data = await getTestAccessData(
    wordsRepository,
    goalsRepository,
    testsRepository,
    now,
  );
  const lockReason = getTestLockReason(
    {
      goal: data.goal,
      todayWords: data.todayWords,
      wordCount: data.words.length,
      lastTestAt: data.lastTestAt,
    },
    data.now,
  );

  if (lockReason) {
    return { status: lockReason };
  }

  const expectedQuestionCount = Math.min(data.goal ?? 0, data.words.length);
  const answerIds = parsedInput.data.map(({ wordId }) => wordId);
  const uniqueAnswerIds = new Set(answerIds);

  if (
    answerIds.length !== expectedQuestionCount ||
    uniqueAnswerIds.size !== expectedQuestionCount
  ) {
    return { status: "invalid" as const };
  }

  const wordsById = new Map(data.words.map((word) => [word.id, word.word]));

  if (answerIds.some((wordId) => !wordsById.has(wordId))) {
    return { status: "invalid" as const };
  }

  const score = parsedInput.data.reduce((correct, { wordId, answer }) => {
    const word = wordsById.get(wordId);

    return word && normalizeAnswer(word) === normalizeAnswer(answer)
      ? correct + 1
      : correct;
  }, 0);

  await testsRepository.recordCompletion({
    score,
    total: expectedQuestionCount,
    completedAt: now,
  });
  revalidatePath("/");
  revalidatePath("/teste");
  revalidatePath("/testes");

  return {
    status: "completed" as const,
    score,
    total: expectedQuestionCount,
    completedAt: now.getTime(),
  };
}
