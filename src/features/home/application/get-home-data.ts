import type { WordsRepository } from "@/features/words/application/words-repository";
import type { Word } from "@/features/words/domain/word";
import type { DailyGoalsRepository } from "./daily-goals-repository";
import {
  getDateKey,
  getDateStart,
  getHourInTimeZone,
  shiftDateKey,
} from "@/features/home/domain/home-date";

const defaultGoal = 5;

export interface HomeDay {
  date: string;
  count: number;
  goal: number;
  hit: boolean;
}

export interface HomeData {
  greeting: string;
  total: number;
  today: number;
  week: number;
  streak: number;
  goal: number;
  goalActive: boolean;
  days: HomeDay[];
  recentWords: Word[];
}

export interface HomeHeaderData {
  total: number;
  streak: number;
}

function getGreeting(date: Date, goalReached: boolean): string {
  const hour = getHourInTimeZone(date);
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return `${greeting}! ${
    goalReached ? "Meta de hoje concluída 🎉" : "Vamos treinar seu inglês hoje?"
  }`;
}

function countWordsByDay(createdAt: Date[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const date of createdAt) {
    const key = getDateKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function getCurrentStreak(counts: Map<string, number>, today: string): number {
  let date = counts.has(today) ? today : shiftDateKey(today, -1);
  let streak = 0;

  while (counts.has(date)) {
    streak += 1;
    date = shiftDateKey(date, -1);
  }

  return streak;
}

export interface WordStreaks {
  current: number;
  longest: number;
}

export function getWordStreaks(
  createdAt: Date[],
  now: Date = new Date(),
): WordStreaks {
  const counts = countWordsByDay(createdAt);
  const dates = [...counts.keys()].sort();
  let longest = 0;
  let current = 0;
  let previousDate: string | null = null;

  for (const date of dates) {
    current =
      previousDate && shiftDateKey(previousDate, 1) === date ? current + 1 : 1;
    longest = Math.max(longest, current);
    previousDate = date;
  }

  return {
    current: getCurrentStreak(counts, getDateKey(now)),
    longest,
  };
}

export async function getHomeData(
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  now: Date = new Date(),
): Promise<HomeData> {
  const todayKey = getDateKey(now);
  const firstDayKey = shiftDateKey(todayKey, -6);
  const activityStart = getDateStart(shiftDateKey(todayKey, -365));
  const [total, recentWords, createdAt, goals] = await Promise.all([
    wordsRepository.getCount(),
    wordsRepository.findRecent(10),
    wordsRepository.findCreatedSince(activityStart),
    goalsRepository.findSince(firstDayKey),
  ]);
  const counts = countWordsByDay(createdAt);
  const goalByDay = new Map(goals.map(({ dateKey, goal }) => [dateKey, goal]));
  const today = counts.get(todayKey) ?? 0;
  const activeGoal = goalByDay.get(todayKey);
  const goal = activeGoal ?? defaultGoal;
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateKey(firstDayKey, index);
    const count = counts.get(date) ?? 0;
    const dayGoal = goalByDay.get(date) ?? defaultGoal;

    return { date, count, goal: dayGoal, hit: count >= dayGoal };
  });

  return {
    greeting: getGreeting(now, today >= goal),
    total,
    today,
    week: days.reduce((sum, day) => sum + day.count, 0),
    streak: getCurrentStreak(counts, todayKey),
    goal,
    goalActive: activeGoal !== undefined,
    days,
    recentWords,
  };
}

export async function getHomeHeaderData(
  wordsRepository: WordsRepository,
  now: Date = new Date(),
): Promise<HomeHeaderData> {
  const todayKey = getDateKey(now);
  const [total, createdAt] = await Promise.all([
    wordsRepository.getCount(),
    wordsRepository.findCreatedSince(
      getDateStart(shiftDateKey(todayKey, -365)),
    ),
  ]);

  return {
    total,
    streak: getCurrentStreak(countWordsByDay(createdAt), todayKey),
  };
}

export async function getGoalValidationData(
  wordsRepository: WordsRepository,
  goalsRepository: DailyGoalsRepository,
  now: Date = new Date(),
) {
  const todayKey = getDateKey(now);
  const [todayWords, dailyGoal] = await Promise.all([
    wordsRepository.countCreatedSince(getDateStart(todayKey)),
    goalsRepository.findToday(todayKey),
  ]);

  return { todayKey, todayWords, dailyGoal };
}
