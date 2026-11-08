import type { WordsRepository } from "@/features/words/application/words-repository";
import {
  getDateKey,
  getDateStart,
  shiftDateKey,
} from "@/features/home/domain/home-date";

export interface WordPerformanceDay {
  date: string;
  count: number;
  label7: string;
  label14: string;
}

export interface WordPerformancePeriod {
  days: WordPerformanceDay[];
  total: number;
  average: string;
  bestDay: number;
}

export interface WordsOverviewData {
  total: number;
  week: number;
  average: string;
  bestDay: number;
}

function countByDate(dates: Date[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const date of dates) {
    const key = getDateKey(date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function formatAverage(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

function getWeekdayLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "narrow",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

function createPerformancePeriod(
  days: WordPerformanceDay[],
): WordPerformancePeriod {
  const total = days.reduce((sum, day) => sum + day.count, 0);

  return {
    days,
    total,
    average: formatAverage(total / days.length),
    bestDay: Math.max(0, ...days.map((day) => day.count)),
  };
}

export async function getWordsOverviewData(
  repository: WordsRepository,
  now: Date = new Date(),
): Promise<WordsOverviewData> {
  const createdAt = await repository.findAllCreatedAt();
  const counts = countByDate(createdAt);
  const todayKey = getDateKey(now);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) =>
    shiftDateKey(todayKey, index - 6),
  );
  const week = lastSevenDays.reduce(
    (sum, date) => sum + (counts.get(date) ?? 0),
    0,
  );

  return {
    total: createdAt.length,
    week,
    average: formatAverage(week / 7),
    bestDay: Math.max(0, ...counts.values()),
  };
}

export async function getWordsPerformanceData(
  repository: WordsRepository,
  now: Date = new Date(),
): Promise<{
  sevenDays: WordPerformancePeriod;
  fourteenDays: WordPerformancePeriod;
}> {
  const todayKey = getDateKey(now);
  const firstDate = shiftDateKey(todayKey, -13);
  const createdAt = await repository.findCreatedSince(getDateStart(firstDate));
  const counts = countByDate(createdAt);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = shiftDateKey(firstDate, index);
    const dateValue = new Date(`${date}T12:00:00.000Z`);

    return {
      date,
      count: counts.get(date) ?? 0,
      label7: getWeekdayLabel(date),
      label14: String(dateValue.getUTCDate()),
    };
  });

  return {
    sevenDays: createPerformancePeriod(days.slice(-7)),
    fourteenDays: createPerformancePeriod(days),
  };
}
