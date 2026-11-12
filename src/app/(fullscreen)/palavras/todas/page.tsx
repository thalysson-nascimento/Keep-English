import { Suspense } from "react";
import { connection } from "next/server";
import { getWordsPage } from "@/features/words/application/words-service";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { AllWordsScreen } from "@/features/words/presentation/components/all-words-screen";
import { WordsAllScreenSkeleton } from "@/features/words/presentation/components/words-all-screen-skeleton";
import { requireCurrentUserId } from "@/core/auth/session";

const wordsPageSize = 15;

async function AllWordsContent() {
  await connection();
  const userId = await requireCurrentUserId();
  const initialPage = await getWordsPage(
    createPrismaWordsRepository(userId),
    "",
    0,
    wordsPageSize,
  );

  return (
    <AllWordsScreen
      initialHasMore={initialPage.hasMore}
      initialTotal={initialPage.total}
      initialWords={initialPage.words}
    />
  );
}

export default function AllWordsPage() {
  return (
    <Suspense fallback={<WordsAllScreenSkeleton />}>
      <AllWordsContent />
    </Suspense>
  );
}
