import {
  getDateKey,
  getDateStart,
  shiftDateKey,
} from "@/features/home/domain/home-date";
import type { RankingRepository } from "./ranking-repository";

export interface WeeklyRankingEntry {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  total: number;
  days: number[];
  isCurrentUser: boolean;
}

export interface WeeklyRankingPage {
  items: WeeklyRankingEntry[];
  total: number;
  hasMore: boolean;
}

export interface WeeklyRankingComparison {
  me: WeeklyRankingEntry;
  others: WeeklyRankingEntry[];
  dayKeys: string[];
}

export interface WeeklyRanking {
  entries: WeeklyRankingEntry[];
  currentUser: WeeklyRankingEntry;
  top: WeeklyRankingEntry[];
  comparison: WeeklyRankingComparison;
}

export async function getWeeklyRanking(
  repository: RankingRepository,
  currentUserId: string,
  now: Date = new Date(),
): Promise<WeeklyRanking> {
  const todayKey = getDateKey(now);
  const firstDayKey = shiftDateKey(todayKey, -6);
  const dayKeys = Array.from({ length: 7 }, (_, index) =>
    shiftDateKey(firstDayKey, index),
  );
  const firstDay = getDateStart(firstDayKey);
  const [users, words, tests] = await Promise.all([
    repository.findUsers(),
    repository.findWordsCreatedSince(firstDay),
    repository.findTestsCompletedSince(firstDay),
  ]);
  const pointsByUser = new Map<string, Map<string, number>>();

  for (const user of users) {
    pointsByUser.set(user.id, new Map());
  }

  for (const word of words) {
    if (word.userId) {
      addPoints(pointsByUser, word.userId, getDateKey(word.createdAt), 10);
    }
  }

  for (const test of tests) {
    if (test.userId) {
      addPoints(
        pointsByUser,
        test.userId,
        getDateKey(test.completedAt),
        test.score * 5,
      );
    }
  }

  const entries = users
    .map((user) => {
      const dailyPoints = pointsByUser.get(user.id);
      const days = dayKeys.map((key) => {
        return dailyPoints?.get(key) ?? 0;
      });

      return {
        ...user,
        rank: 0,
        total: days.reduce((sum, points) => sum + points, 0),
        days,
        isCurrentUser: user.id === currentUserId,
      };
    })
    .sort(
      (a, b) =>
        b.total - a.total ||
        Number(b.isCurrentUser) - Number(a.isCurrentUser) ||
        a.name.localeCompare(b.name),
    )
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const currentUser = entries.find((entry) => entry.isCurrentUser);

  if (!currentUser) {
    throw new Error("The authenticated user was not found in the ranking.");
  }

  return {
    entries,
    currentUser,
    top: entries.slice(0, 3),
    comparison: {
      me: currentUser,
      others: findNearbyEntries(entries, currentUser),
      dayKeys,
    },
  };
}

export function getWeeklyRankingPage(
  entries: WeeklyRankingEntry[],
  offset: number,
  limit: number,
): WeeklyRankingPage {
  const items = entries.slice(offset, offset + limit);

  return {
    items,
    total: entries.length,
    hasMore: offset + limit < entries.length,
  };
}

function addPoints(
  pointsByUser: Map<string, Map<string, number>>,
  userId: string,
  dateKey: string,
  points: number,
): void {
  const dailyPoints = pointsByUser.get(userId);

  if (!dailyPoints) {
    return;
  }

  dailyPoints.set(dateKey, (dailyPoints.get(dateKey) ?? 0) + points);
}

function findNearbyEntries(
  entries: WeeklyRankingEntry[],
  currentUser: WeeklyRankingEntry,
): WeeklyRankingEntry[] {
  const index = currentUser.rank - 1;
  const above = entries.slice(Math.max(0, index - 2), index).reverse();
  const below = entries.slice(index + 1, index + 3);

  return [...above, ...below].slice(0, 2);
}
