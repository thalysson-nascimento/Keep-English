import { connection } from "next/server";
import { getHomeHeaderData } from "@/features/home/application/get-home-data";
import { createPrismaWordsRepository } from "@/features/words/infrastructure/prisma-words-repository";
import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import styles from "@/shared/components/app-shell.module.css";

interface HomeHeaderStatsProps {
  userId: string;
}

export async function HomeHeaderStats({ userId }: HomeHeaderStatsProps) {
  await connection();
  const locale = await getRequestLocale();
  const { streak, total } = await getHomeHeaderData(
    createPrismaWordsRepository(userId),
  );

  return (
    <div
      className={styles.headerStats}
      aria-label={translate(locale, "home.header.progress")}
    >
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
