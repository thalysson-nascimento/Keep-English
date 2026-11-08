"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getGoalValidationData } from "@/features/home/application/get-home-data";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { wordInputSchema } from "@/features/words/application/word-input.schema";
import {
  createWord,
  getWordsPage,
  normalizeWord,
  searchWords,
} from "@/features/words/application/words-service";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { lookupWord } from "@/features/words/infrastructure/public-word-lookup";
import type { Word } from "@/features/words/domain/word";
import type { WordLookup } from "@/features/words/domain/word-lookup";
import { requireCurrentUserId } from "@/core/auth/session";

export type CreateWordResult =
  | { status: "created"; word: Word }
  | { status: "duplicate" }
  | { status: "invalid" }
  | { status: "goal-required" }
  | { status: "goal-reached" };

const lookupInputSchema = z.object({
  word: z.string().trim().min(1).max(80),
  skipCorrection: z.boolean(),
});
const searchQuerySchema = z.string().trim().min(1).max(80);
const wordsPageSchema = z.object({
  query: z.string().trim().max(80),
  offset: z.number().int().min(0).max(100000),
});
const wordIdSchema = z.string().cuid();
const dailyGoalSchema = z.union([
  z.literal(3),
  z.literal(5),
  z.literal(10),
  z.literal(15),
  z.literal(20),
]);
const wordsPageSize = 15;

export async function lookupWordAction(
  input: unknown,
): Promise<
  | { status: "invalid" }
  | { status: "ok"; lookup: WordLookup; duplicate: boolean }
> {
  const parsedInput = lookupInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { status: "invalid" as const };
  }

  const userId = await requireCurrentUserId();
  const result = await lookupWord(
    parsedInput.data.word,
    parsedInput.data.skipCorrection,
  );
  const duplicate = await createPrismaWordsRepository(userId).existsByWordKey(
    normalizeWord(result.word),
  );

  return { status: "ok" as const, lookup: result, duplicate };
}

export async function createWordAction(
  input: unknown,
): Promise<CreateWordResult> {
  const parsedInput = wordInputSchema.safeParse(input);

  if (!parsedInput.success) {
    return { status: "invalid" };
  }

  const userId = await requireCurrentUserId();
  const repository = createPrismaWordsRepository(userId);
  const goalData = await getGoalValidationData(
    repository,
    createPrismaDailyGoalsRepository(userId),
  );

  if (!goalData.dailyGoal) {
    return { status: "goal-required" };
  }

  if (goalData.todayWords >= goalData.dailyGoal.goal) {
    return { status: "goal-reached" };
  }

  const word = await createWord(repository, parsedInput.data);

  if (!word) {
    return { status: "duplicate" };
  }

  revalidatePath("/");
  revalidatePath("/palavras");
  revalidatePath("/palavras/todas");
  return { status: "created", word };
}

export async function enableDailyGoalAction(value: unknown) {
  const parsedGoal = dailyGoalSchema.safeParse(value);

  if (!parsedGoal.success) {
    return { status: "invalid" as const };
  }

  const userId = await requireCurrentUserId();
  const wordsRepository = createPrismaWordsRepository(userId);
  const goalsRepository = createPrismaDailyGoalsRepository(userId);
  const { todayKey, todayWords, dailyGoal } = await getGoalValidationData(
    wordsRepository,
    goalsRepository,
  );
  const selectedGoal = parsedGoal.data;

  if (
    (dailyGoal && todayWords < dailyGoal.goal) ||
    (!dailyGoal && selectedGoal < todayWords) ||
    (dailyGoal && selectedGoal <= dailyGoal.goal)
  ) {
    return { status: "unavailable" as const };
  }

  await goalsRepository.save(todayKey, selectedGoal);
  revalidatePath("/");

  return { status: "enabled" as const };
}

export async function searchWordsAction(query: string) {
  const parsedQuery = searchQuerySchema.safeParse(query);

  if (!parsedQuery.success) {
    return { status: "invalid" as const, words: [], total: 0 };
  }

  const result = await searchWords(
    createPrismaWordsRepository(await requireCurrentUserId()),
    parsedQuery.data,
  );

  return { status: "ok" as const, ...result };
}

export async function getWordsPageAction(input: unknown) {
  const parsedInput = wordsPageSchema.safeParse(input);

  if (!parsedInput.success) {
    return { status: "invalid" as const };
  }

  const result = await getWordsPage(
    createPrismaWordsRepository(await requireCurrentUserId()),
    parsedInput.data.query,
    parsedInput.data.offset,
    wordsPageSize,
  );

  return { status: "ok" as const, ...result };
}

export async function deleteWordAction(id: string): Promise<boolean> {
  const parsedId = wordIdSchema.safeParse(id);

  if (!parsedId.success) {
    return false;
  }

  const userId = await requireCurrentUserId();
  const deleted = await createPrismaWordsRepository(userId).delete(
    parsedId.data,
  );

  if (deleted) {
    revalidatePath("/");
    revalidatePath("/palavras");
    revalidatePath("/palavras/todas");
  }

  return deleted;
}
