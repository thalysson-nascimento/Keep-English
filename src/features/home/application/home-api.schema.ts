import { z } from "zod";
import { wordResponseSchema } from "@/features/words/application/words-api.schema";

const homeDaySchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
  goal: z.number().int().positive(),
  hit: z.boolean(),
});

export const homeResponseSchema = z.object({
  greetingPeriod: z.enum(["morning", "afternoon", "evening"]),
  goalReached: z.boolean(),
  total: z.number().int().nonnegative(),
  today: z.number().int().nonnegative(),
  week: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  goal: z.number().int().positive(),
  goalActive: z.boolean(),
  latestCompletedGoal: z.number().int().positive().nullable(),
  days: z.array(homeDaySchema).length(7),
  recentWords: z.array(wordResponseSchema),
  lastTestAt: z.number().int().nullable(),
  now: z.number().int(),
});

export type HomeApiData = z.output<typeof homeResponseSchema>;
