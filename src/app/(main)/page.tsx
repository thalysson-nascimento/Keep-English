import { Suspense } from "react";
import { connection } from "next/server";
import { getHomeData } from "@/features/home/application/get-home-data";
import { HomeScreen } from "@/features/home/presentation/home-screen";
import { HomeSkeleton } from "@/features/home/presentation/home-skeleton";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { requireCurrentUserId } from "@/core/auth/session";

async function HomeContent() {
  await connection();
  const userId = await requireCurrentUserId();
  const now = new Date();
  const wordsRepository = createPrismaWordsRepository(userId);
  const testsRepository = createPrismaTestsRepository(userId);
  const data = await getHomeData(
    wordsRepository,
    createPrismaDailyGoalsRepository(userId),
    now,
  );
  const lastTestAt = await testsRepository.findLatestCompletion();

  return (
    <HomeScreen
      initialData={data}
      initialNow={now.getTime()}
      lastTestAt={lastTestAt?.getTime() ?? null}
    />
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
