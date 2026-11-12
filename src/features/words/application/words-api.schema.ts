import { z } from "zod";

export const wordResponseSchema = z.object({
  id: z.string().cuid(),
  word: z.string(),
  translation: z.string(),
  example: z.string().nullable(),
  createdAt: z.string().datetime().transform((value) => new Date(value)),
});

export const wordsPageResponseSchema = z.object({
  words: z.array(wordResponseSchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export const lookupWordResponseSchema = z.object({
  lookup: z.object({
    word: z.string(),
    translation: z.string(),
    example: z.string(),
    sourceLanguage: z.enum(["en", "pt"]),
    correctedWord: z.string().nullable(),
  }),
  duplicate: z.boolean(),
});

export const createWordResponseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("created"), word: wordResponseSchema }),
  z.object({
    status: z.enum(["duplicate", "goal-required", "goal-reached", "invalid"]),
  }),
]);

const performanceDaySchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
  label14: z.string(),
});

const performancePeriodSchema = z.object({
  days: z.array(performanceDaySchema),
  total: z.number().int().nonnegative(),
  average: z.string(),
  bestDay: z.number().int().nonnegative(),
});

export const wordsOverviewResponseSchema = z.object({
  overview: z.object({
    total: z.number().int().nonnegative(),
    week: z.number().int().nonnegative(),
    average: z.string(),
    bestDay: z.number().int().nonnegative(),
  }),
  performance: z.object({
    sevenDays: performancePeriodSchema,
    fourteenDays: performancePeriodSchema,
  }),
  recentWords: z.array(wordResponseSchema),
});
