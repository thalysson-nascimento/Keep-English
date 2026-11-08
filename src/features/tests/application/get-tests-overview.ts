import { getGoalValidationData } from "@/features/home/application/get-home-data";
import type { DailyGoalsRepository } from "@/features/home/application/daily-goals-repository";
import type { WordsRepository } from "@/features/words/application/words-repository";
import type { TestsRepository } from "./tests-repository";

export interface VocabularyTestRecord {
  id: string;
  score: number;
  total: number;
  completedAt: number;
}

export interface TestsOverviewData {
  total: number;
  bestScore: number | null;
  averageScore: number | null;
  latestScore: number | null;
  records: VocabularyTestRecord[];
  access: {
    wordCount: number;
    goal: number | null;
    todayWords: number;
    lastTestAt: number | null;
    now: number;
  };
}

function getPercentage(score: number, total: number): number {
  return Math.round((score / total) * 100);
}

export async function getTestsOverviewData(
  testsRepository: TestsRepository,
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  now: Date = new Date(),
): Promise<TestsOverviewData> {
  const [results, wordCount, goalData] = await Promise.all([
    testsRepository.findAll(),
    wordsRepository.getCount(),
    getGoalValidationData(wordsRepository, goalsRepository, now),
  ]);
  const percentages = results.map(({ score, total }) =>
    getPercentage(score, total),
  );
  const averageScore =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((sum, percentage) => sum + percentage, 0) /
            percentages.length,
        )
      : null;

  return {
    total: results.length,
    bestScore: percentages.length > 0 ? Math.max(...percentages) : null,
    averageScore,
    latestScore: percentages[0] ?? null,
    records: results.map(({ id, score, total, completedAt }) => ({
      id,
      score,
      total,
      completedAt: completedAt.getTime(),
    })),
    access: {
      wordCount,
      goal: goalData.dailyGoal?.goal ?? null,
      todayWords: goalData.todayWords,
      lastTestAt: results[0]?.completedAt.getTime() ?? null,
      now: now.getTime(),
    },
  };
}
