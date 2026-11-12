import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { getGoalValidationData } from "@/features/home/application/get-home-data";
import { getDailyGoalXp } from "@/features/home/domain/daily-goal";
import { getDateStart } from "@/features/home/domain/home-date";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { wordInputSchema } from "@/features/words/application/word-input.schema";
import { createWord, getWordsPage } from "@/features/words/application/words-service";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

const wordsQuerySchema = z.object({
  query: z.string().trim().max(80).default(""),
  offset: z.coerce.number().int().min(0).max(100000).default(0),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsedQuery = wordsQuerySchema.safeParse({
    query: url.searchParams.get("query") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsedQuery.success) {
    return Response.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const result = await getWordsPage(
    createPrismaWordsRepository(session.user.id),
    parsedQuery.data.query,
    parsedQuery.data.offset,
    parsedQuery.data.limit,
  );

  return Response.json(result);
}

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const parsedBody = wordInputSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ status: "invalid" }, { status: 400 });
  }

  const userId = session.user.id;
  const wordsRepository = createPrismaWordsRepository(userId);
  const goalsRepository = createPrismaDailyGoalsRepository(userId);
  const goalData = await getGoalValidationData(wordsRepository, goalsRepository);

  if (!goalData.dailyGoal) {
    return Response.json({ status: "goal-required" }, { status: 409 });
  }

  if (goalData.todayWords >= goalData.dailyGoal.goal) {
    return Response.json({ status: "goal-reached" }, { status: 409 });
  }

  const word = await createWord(wordsRepository, parsedBody.data, {
    dateKey: goalData.todayKey,
    dayStart: getDateStart(goalData.todayKey),
    goal: goalData.dailyGoal.goal,
    xp: getDailyGoalXp(goalData.dailyGoal.goal),
  });

  if (!word) {
    return Response.json({ status: "duplicate" }, { status: 409 });
  }

  return Response.json({ status: "created", word }, { status: 201 });
}
