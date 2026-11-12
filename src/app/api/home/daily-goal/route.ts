import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { getGoalValidationData } from "@/features/home/application/get-home-data";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

const dailyGoalSchema = z.object({
  goal: z.union([
    z.literal(3),
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
  ]),
});

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

  const parsedBody = dailyGoalSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ error: "Meta inválida." }, { status: 400 });
  }

  const userId = session.user.id;
  const wordsRepository = createPrismaWordsRepository(userId);
  const goalsRepository = createPrismaDailyGoalsRepository(userId);
  const { todayKey, todayWords, dailyGoal } = await getGoalValidationData(
    wordsRepository,
    goalsRepository,
  );
  const selectedGoal = parsedBody.data.goal;
  const isLocked =
    (dailyGoal !== null && todayWords < dailyGoal.goal) ||
    (dailyGoal === null && selectedGoal < todayWords) ||
    (dailyGoal !== null && selectedGoal <= dailyGoal.goal);

  if (isLocked) {
    return Response.json(
      { error: "A meta selecionada não está disponível." },
      { status: 409 },
    );
  }

  await goalsRepository.save(todayKey, selectedGoal);

  return Response.json({ status: "enabled" });
}
