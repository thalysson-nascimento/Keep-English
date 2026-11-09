import "server-only";

import { connection } from "next/server";
import {
  getWordsOverviewData,
  getWordsPerformanceData,
} from "@/features/words/application/get-words-overview";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { requireCurrentUserId } from "@/core/auth/session";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import { getIntlLocale } from "@/shared/i18n/config";
import { RecentWords } from "./recent-words";
import { WordsPerformance } from "./words-performance";
import {
  WordsPerformanceSkeleton,
  WordsRecentSkeleton,
  WordsSummarySkeleton,
} from "./words-screen-skeleton";
import styles from "./words-screen.module.css";

export async function WordsSummarySection() {
  await connection();
  const locale = await getRequestLocale();
  const userId = await requireCurrentUserId();
  const data = await getWordsOverviewData(createPrismaWordsRepository(userId));
  const average = new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Number(data.average.replace(",", ".")));

  return (
    <section
      aria-label={translate(locale, "words.summary.aria")}
      className={styles.hero}
    >
      <small>{translate(locale, "words.summary.label")}</small>
      <div className={styles.big}>
        <strong>{data.total}</strong>
        <span>{translate(locale, "words.summary.total")}</span>
      </div>
      <div className={styles.stats}>
        <div>
          <strong>{data.week}</strong>
          <span>{translate(locale, "words.summary.week")}</span>
        </div>
        <div>
          <strong>{average}</strong>
          <span>{translate(locale, "words.summary.average")}</span>
        </div>
        <div>
          <strong>{data.bestDay}</strong>
          <span>{translate(locale, "words.summary.best")}</span>
        </div>
      </div>
    </section>
  );
}

export async function WordsPerformanceSection() {
  await connection();
  const locale = await getRequestLocale();
  const userId = await requireCurrentUserId();
  const data = await getWordsPerformanceData(
    createPrismaWordsRepository(userId),
  );

  return (
    <section
      aria-labelledby="words-performance-title"
      className={styles.section}
    >
      <h2 id="words-performance-title">
        {translate(locale, "words.performance.title")}
      </h2>
      <WordsPerformance data={data} />
    </section>
  );
}

export async function RecentWordsSection() {
  await connection();
  const locale = await getRequestLocale();
  const userId = await requireCurrentUserId();
  const repository = createPrismaWordsRepository(userId);
  const [words, total] = await Promise.all([
    repository.findRecent(10),
    repository.getCount(),
  ]);

  return (
    <section aria-labelledby="recent-words-title" className={styles.section}>
      <h2 id="recent-words-title">{translate(locale, "words.recent.title")}</h2>
      <RecentWords initialWords={words} total={total} />
    </section>
  );
}

export { WordsPerformanceSkeleton, WordsRecentSkeleton, WordsSummarySkeleton };
