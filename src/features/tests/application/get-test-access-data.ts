import type { DailyGoalsRepository } from "@/features/home/application/daily-goals-repository";
import { getDateKey, getDateStart } from "@/features/home/domain/home-date";
import type { WordsRepository } from "@/features/words/application/words-repository";
import type { TestsRepository } from "./tests-repository";
import type { VocabularyTestWord } from "@/features/tests/domain/vocabulary-test";

export interface TestAccessData {
  words: VocabularyTestWord[];
  goal: number | null;
  todayWords: number;
  lastTestAt: number | null;
  now: number;
}

export async function getTestAccessData(
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  testsRepository: TestsRepository,
  now: Date = new Date(),
): Promise<TestAccessData> {
  const todayKey = getDateKey(now);
  const [words, todayWords, dailyGoal, lastTestAt] = await Promise.all([
    wordsRepository.findAll(),
    wordsRepository.countCreatedSince(getDateStart(todayKey)),
    goalsRepository.findToday(todayKey),
    testsRepository.findLatestCompletion(),
  ]);

  return {
    words: words.map(({ id, word, translation }) => ({
      id,
      word,
      translation,
    })),
    goal: dailyGoal?.goal ?? null,
    todayWords,
    lastTestAt: lastTestAt?.getTime() ?? null,
    now: now.getTime(),
  };
}
