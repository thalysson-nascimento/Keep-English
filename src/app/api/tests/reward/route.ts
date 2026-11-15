import { z } from "zod";
import { getSessionFromHeaders } from "@/core/auth/session";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { getTestAccessData } from "@/features/tests/application/get-test-access-data";
import { getTestLockReason } from "@/features/tests/domain/vocabulary-test";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import {
  createRewardRequest,
  getRewardStatus,
} from "@/features/tests/infrastructure/rewarded-test-access";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid origin." }, { status: 403 });
  }
  const session = await getSessionFromHeaders(request.headers);
  if (!session)
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  const userId = session.user.id;
  const data = await getTestAccessData(
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
    createPrismaTestsRepository(userId),
  );
  const lock = getTestLockReason(
    { ...data, cooldownBypass: false, wordCount: data.words.length },
    data.now,
  );
  if (lock !== "cooldown" || data.lastTestAt === null) {
    return Response.json(
      { error: "Test is not waiting for the cooldown." },
      { status: 409 },
    );
  }
  const reward = await createRewardRequest(userId, new Date(data.lastTestAt));
  return Response.json({
    requestId: reward.id,
    granted: reward.verifiedAt !== null,
  });
}

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);
  if (!session)
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  const id = z
    .string()
    .uuid()
    .safeParse(new URL(request.url).searchParams.get("requestId"));
  if (!id.success)
    return Response.json({ error: "Invalid request." }, { status: 400 });
  const status = await getRewardStatus(session.user.id, id.data, new Date());
  return Response.json(
    { status },
    { headers: { "Cache-Control": "no-store" } },
  );
}
