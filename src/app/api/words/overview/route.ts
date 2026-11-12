import { getSessionFromHeaders } from "@/core/auth/session";
import {
  getWordsOverviewData,
  getWordsPerformanceData,
} from "@/features/words/application/get-words-overview";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const repository = createPrismaWordsRepository(session.user.id);
  const [overview, performance, recentWords] = await Promise.all([
    getWordsOverviewData(repository),
    getWordsPerformanceData(repository),
    repository.findRecent(10),
  ]);

  return Response.json({ overview, performance, recentWords });
}
