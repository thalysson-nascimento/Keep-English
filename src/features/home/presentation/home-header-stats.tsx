"use client";

import { z } from "zod";
import {
  ApiRequestError,
  requestApiJson,
  subscribeToAccountDataChanged,
} from "@/shared/lib/api-client";
import { useI18n } from "@/shared/i18n/locale-provider";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/shared/components/app-shell.module.css";

const headerStatsSchema = z.object({
  total: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
});

type HeaderStats = z.infer<typeof headerStatsSchema>;

export function HomeHeaderStats() {
  const { t } = useI18n();
  const router = useRouter();
  const [stats, setStats] = useState<HeaderStats | null>(null);
  const [hasError, setHasError] = useState(false);

  const loadStats = useCallback(
    () =>
      requestApiJson("/api/home/summary", headerStatsSchema, {
        cache: "no-store",
      }),
    [],
  );

  useEffect(() => {
    const updateStats = () => {
      void loadStats()
        .then((result) => {
          setStats(result);
          setHasError(false);
        })
        .catch((error: unknown) => {
          if (error instanceof ApiRequestError && error.status === 401) {
            router.replace("/login");
            return;
          }

          setHasError(true);
        });
    };

    updateStats();
    return subscribeToAccountDataChanged(updateStats);
  }, [loadStats, router]);

  if (!stats) {
    return (
      <div
        aria-label={hasError ? t("home.loadFailed") : t("common.loading")}
        aria-live="polite"
        className={styles.headerStats}
        role={hasError ? "alert" : "status"}
      >
        {hasError && t("home.loadFailed")}
      </div>
    );
  }

  return (
    <div
      className={styles.headerStats}
      aria-label={t("home.header.progress")}
    >
      <span className={styles.streakStat}>
        <span aria-hidden="true">🔥</span>
        {stats.streak}
      </span>
      <span className={styles.wordsStat}>
        <span aria-hidden="true">📘</span>
        {stats.total}
      </span>
      <span className={styles.xpStat}>
        <span aria-hidden="true">✦</span>
        {stats.xp} XP
      </span>
    </div>
  );
}
