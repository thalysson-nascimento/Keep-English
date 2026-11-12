import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { completeVocabularyTest } from "@/features/tests/application/complete-vocabulary-test";
import { maxVocabularyTestQuestionCount } from "@/features/tests/domain/vocabulary-test";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

const answersSchema = z
  .array(
    z.object({
      wordId: z.string().cuid(),
      answer: z.string().trim().min(1).max(100),
    }),
  )
  .min(1)
  .max(maxVocabularyTestQuestionCount);

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return Response.json({ error: "Autenticação necessária." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ status: "invalid" }, { status: 400 });
  }

  const parsedBody = answersSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ status: "invalid" }, { status: 400 });
  }

  const userId = session.user.id;
  const result = await completeVocabularyTest(
    parsedBody.data,
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
    createPrismaTestsRepository(userId),
  );

  if (result.status !== "completed") {
    return Response.json(result, {
      status: result.status === "invalid" ? 400 : 409,
    });
  }

  return Response.json(result);
}
