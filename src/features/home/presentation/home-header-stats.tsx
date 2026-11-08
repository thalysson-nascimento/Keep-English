import { connection } from "next/server";
import { getHomeHeaderData } from "@/features/home/application/get-home-data";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import styles from "@/shared/components/app-shell.module.css";

interface HomeHeaderStatsProps {
  userId: string;
}

export async function HomeHeaderStats({ userId }: HomeHeaderStatsProps) {
  await connection();
  const { streak, total } = await getHomeHeaderData(
    createPrismaWordsRepository(userId),
  );

  return (
    <div className={styles.headerStats} aria-label="Seu progresso">
      <span className={styles.streakStat}>
        <span aria-hidden="true">🔥</span>
        {streak}
      </span>
      <span className={styles.wordsStat}>
        <span aria-hidden="true">📘</span>
        {total}
      </span>
    </div>
  );
}
