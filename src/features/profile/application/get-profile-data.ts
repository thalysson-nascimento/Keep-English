import { getDateKey } from "@/features/home/domain/home-date";
import { getWordStreaks } from "@/features/home/application/get-home-data";
import type { DailyGoalsRepository } from "@/features/home/application/daily-goals-repository";
import type { TestsRepository } from "@/features/tests/application/tests-repository";
import type { WordsRepository } from "@/features/words/application/words-repository";
import type { ProfileRepository } from "./profile-repository";

const defaultDailyGoal = 5;

export interface ProfileData {
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  savedWords: number;
  currentStreak: number;
  longestStreak: number;
  completedTests: number;
  averageScore: number | null;
  dailyGoal: number;
}

export async function getProfileData(
  userId: string,
  profileRepository: ProfileRepository,
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  testsRepository: TestsRepository,
  now: Date = new Date(),
): Promise<ProfileData | null> {
  const [user, savedWords, wordDates, todayGoal, testResults] =
    await Promise.all([
      profileRepository.findById(userId),
      wordsRepository.getCount(),
      wordsRepository.findAllCreatedAt(),
      goalsRepository.findToday(getDateKey(now)),
      testsRepository.findAll(),
    ]);

  if (!user) {
    return null;
  }

  const streaks = getWordStreaks(wordDates, now);
  const validTests = testResults.filter(({ total }) => total > 0);
  const averageScore =
    validTests.length > 0
      ? Math.round(
          validTests.reduce(
            (sum, { score, total }) => sum + (score / total) * 100,
            0,
          ) / validTests.length,
        )
      : null;

  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    savedWords,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    completedTests: testResults.length,
    averageScore,
    dailyGoal: todayGoal?.goal ?? defaultDailyGoal,
  };
}
