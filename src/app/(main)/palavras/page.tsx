import { Suspense } from "react";
import {
  RecentWordsSection,
  WordsPerformanceSection,
  WordsPerformanceSkeleton,
  WordsRecentSkeleton,
  WordsSummarySection,
  WordsSummarySkeleton,
} from "@/features/words/presentation/components/words-screen-sections";

export default function WordsPage() {
  return (
    <div>
      <Suspense fallback={<WordsSummarySkeleton />}>
        <WordsSummarySection />
      </Suspense>
      <Suspense fallback={<WordsPerformanceSkeleton />}>
        <WordsPerformanceSection />
      </Suspense>
      <Suspense fallback={<WordsRecentSkeleton />}>
        <RecentWordsSection />
      </Suspense>
    </div>
  );
}
