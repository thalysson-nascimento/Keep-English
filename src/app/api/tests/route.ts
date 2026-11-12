import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { getTestsOverviewData } from "@/features/tests/application/get-tests-overview";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const userId = session.user.id;
  const data = await getTestsOverviewData(
    createPrismaTestsRepository(userId),
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
  );

  return Response.json(data);
}
