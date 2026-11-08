import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaProfileRepository } from "@/features/profile/infrastructure/prisma-profile-repository";
import { getProfileData } from "@/features/profile/application/get-profile-data";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json(
      { error: "Autenticação necessária." },
      { status: 401 },
    );
  }

  const userId = session.user.id;
  const profile = await getProfileData(
    userId,
    createPrismaProfileRepository(),
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
    createPrismaTestsRepository(userId),
  );

  if (!profile) {
    return Response.json({ error: "Perfil não encontrado." }, { status: 404 });
  }

  return Response.json(profile);
}
