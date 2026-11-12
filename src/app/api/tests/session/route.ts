import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { getTestAccessData } from "@/features/tests/application/get-test-access-data";
import { createVocabularyQuestions } from "@/features/tests/domain/vocabulary-test";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  const userId = session.user.id;
  const data = await getTestAccessData(
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
    createPrismaTestsRepository(userId),
  );

  return Response.json({
    ...data,
    questions: createVocabularyQuestions(
      data.words,
      Math.min(data.goal ?? 0, data.words.length),
    ),
  });
}
