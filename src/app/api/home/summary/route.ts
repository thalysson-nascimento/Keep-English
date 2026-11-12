import { getSessionFromHeaders } from "@/core/auth/session";
import { getHomeHeaderData } from "@/features/home/application/get-home-data";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const userId = session.user.id;
  const summary = await getHomeHeaderData(
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
  );

  return Response.json(summary);
}
