import { z } from "zod";

const testRecordSchema = z.object({
  id: z.string().cuid(),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  completedAt: z.number().int(),
});

export const testsOverviewResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  bestScore: z.number().int().min(0).max(100).nullable(),
  averageScore: z.number().int().min(0).max(100).nullable(),
  latestScore: z.number().int().min(0).max(100).nullable(),
  records: z.array(testRecordSchema),
  access: z.object({
    wordCount: z.number().int().nonnegative(),
    goal: z.number().int().positive().nullable(),
    todayWords: z.number().int().nonnegative(),
    lastTestAt: z.number().int().nullable(),
    now: z.number().int(),
  }),
});

export const testSessionResponseSchema = z.object({
  words: z.array(
    z.object({
      id: z.string().cuid(),
      word: z.string(),
      translation: z.string(),
    }),
  ),
  goal: z.number().int().positive().nullable(),
  todayWords: z.number().int().nonnegative(),
  lastTestAt: z.number().int().nullable(),
  now: z.number().int(),
  questions: z.array(
    z.object({
      id: z.string().cuid(),
      word: z.string(),
      translation: z.string(),
      options: z.array(z.string()).length(4).nullable(),
    }),
  ),
});

export const testCompletionResponseSchema = z.object({
  status: z.literal("completed"),
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  completedAt: z.number().int(),
});

export const testCompletionResultSchema = z.discriminatedUnion("status", [
  testCompletionResponseSchema,
  z.object({ status: z.enum(["invalid", "words", "goal", "cooldown"]) }),
]);
