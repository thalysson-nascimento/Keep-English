import { getTestAccessData } from "@/features/tests/application/get-test-access-data";
import type { DailyGoalsRepository } from "@/features/home/application/daily-goals-repository";
import type { TestsRepository } from "@/features/tests/application/tests-repository";
import {
  getTestLockReason,
  maxVocabularyTestQuestionCount,
  normalizeAnswer,
} from "@/features/tests/domain/vocabulary-test";
import type { WordsRepository } from "@/features/words/application/words-repository";

export interface SubmittedTestAnswer {
  wordId: string;
  answer: string;
}

export type CompleteVocabularyTestResult =
  | { status: "completed"; score: number; total: number; completedAt: number }
  | { status: "invalid" | "words" | "goal" | "cooldown" };

export async function completeVocabularyTest(
  input: SubmittedTestAnswer[],
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  testsRepository: TestsRepository,
  now: Date = new Date(),
): Promise<CompleteVocabularyTestResult> {
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
  const answerIds = input.map(({ wordId }) => wordId);
  const uniqueAnswerIds = new Set(answerIds);

  if (
    input.length === 0 ||
    input.length > maxVocabularyTestQuestionCount ||
    answerIds.length !== expectedQuestionCount ||
    uniqueAnswerIds.size !== expectedQuestionCount
  ) {
    return { status: "invalid" };
  }

  const wordsById = new Map(data.words.map(({ id, word }) => [id, word]));

  if (answerIds.some((wordId) => !wordsById.has(wordId))) {
    return { status: "invalid" };
  }

  const score = input.reduce((correct, { wordId, answer }) => {
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

  return {
    status: "completed",
    score,
    total: expectedQuestionCount,
    completedAt: now.getTime(),
  };
}
