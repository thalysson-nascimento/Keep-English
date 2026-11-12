import "server-only";

import { getSessionFromHeaders } from "@/core/auth/session";
import { getWeeklyRanking } from "@/features/ranking/application/weekly-ranking";
import { createPrismaRankingRepository } from "@/features/ranking/infrastructure/prisma-ranking-repository";

export async function getRankingForRequest(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return null;
  }

  return getWeeklyRanking(createPrismaRankingRepository(), session.user.id);
}
