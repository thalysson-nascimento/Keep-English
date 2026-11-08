import "server-only";

import { connection } from "next/server";
import {
  getWordsOverviewData,
  getWordsPerformanceData,
} from "@/features/words/application/get-words-overview";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { requireCurrentUserId } from "@/core/auth/session";
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
  const userId = await requireCurrentUserId();
  const data = await getWordsOverviewData(createPrismaWordsRepository(userId));

  return (
    <section aria-label="Resumo das palavras salvas" className={styles.hero}>
      <small>PALAVRAS SALVAS</small>
      <div className={styles.big}>
        <strong>{data.total}</strong>
        <span>no total</span>
      </div>
      <div className={styles.stats}>
        <div>
          <strong>{data.week}</strong>
          <span>Semana</span>
        </div>
        <div>
          <strong>{data.average}</strong>
          <span>Média/dia</span>
        </div>
        <div>
          <strong>{data.bestDay}</strong>
          <span>Melhor dia</span>
        </div>
      </div>
    </section>
  );
}

export async function WordsPerformanceSection() {
  await connection();
  const userId = await requireCurrentUserId();
  const data = await getWordsPerformanceData(
    createPrismaWordsRepository(userId),
  );

  return (
    <section
      aria-labelledby="words-performance-title"
      className={styles.section}
    >
      <h2 id="words-performance-title">Seu desempenho</h2>
      <WordsPerformance data={data} />
    </section>
  );
}

export async function RecentWordsSection() {
  await connection();
  const userId = await requireCurrentUserId();
  const repository = createPrismaWordsRepository(userId);
  const [words, total] = await Promise.all([
    repository.findRecent(10),
    repository.getCount(),
  ]);

  return (
    <section aria-labelledby="recent-words-title" className={styles.section}>
      <h2 id="recent-words-title">Últimas palavras</h2>
      <RecentWords initialWords={words} total={total} />
    </section>
  );
}

export { WordsPerformanceSkeleton, WordsRecentSkeleton, WordsSummarySkeleton };
