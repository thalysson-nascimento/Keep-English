import { Suspense } from "react";
import { connection } from "next/server";
import { getTestsOverviewData } from "@/features/tests/application/get-tests-overview";
import { createPrismaTestsRepository } from "@/features/tests/infrastructure/prisma-tests-repository";
import {
  TestsScreen,
  TestsScreenSkeleton,
} from "@/features/tests/presentation/tests-screen";
import { createPrismaDailyGoalsRepository } from "@/features/home/infrastructure/prisma-daily-goals-repository";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { requireCurrentUserId } from "@/core/auth/session";

async function TestsContent() {
  await connection();
  const userId = await requireCurrentUserId();
  const data = await getTestsOverviewData(
    createPrismaTestsRepository(userId),
    createPrismaWordsRepository(userId),
    createPrismaDailyGoalsRepository(userId),
  );

  return <TestsScreen data={data} />;
}

export default function TestsPage() {
  return (
    <Suspense fallback={<TestsScreenSkeleton />}>
      <TestsContent />
    </Suspense>
  );
}
