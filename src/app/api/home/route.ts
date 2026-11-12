import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { getHomeData } from "@/features/home/application/get-home-data";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const wordsRepository = createPrismaWordsRepository(userId);
  const goalsRepository = createPrismaDailyGoalsRepository(userId);
  const testsRepository = createPrismaTestsRepository(userId);
  const [home, lastTestAt] = await Promise.all([
    getHomeData(wordsRepository, goalsRepository, now),
    testsRepository.findLatestCompletion(),
  ]);

  return Response.json({
    ...home,
    lastTestAt: lastTestAt?.getTime() ?? null,
    now: now.getTime(),
  });
}
