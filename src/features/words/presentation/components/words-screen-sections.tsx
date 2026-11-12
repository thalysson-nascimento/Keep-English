"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiRequestError,
  requestApiJson,
  subscribeToAccountDataChanged,
} from "@/shared/lib/api-client";
import { useI18n } from "@/shared/i18n/locale-provider";
import { getIntlLocale } from "@/shared/i18n/config";
import { wordsOverviewResponseSchema } from "@/features/words/application/words-api.schema";
import { RecentWords } from "./recent-words";
import { WordsPerformance } from "./words-performance";
import {
  WordsPerformanceSkeleton,
  WordsRecentSkeleton,
  WordsSummarySkeleton,
} from "./words-screen-skeleton";
import styles from "./words-screen.module.css";

export function WordsScreenSections() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<
    ReturnType<typeof wordsOverviewResponseSchema.parse> | null
  >(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const loadOverview = useCallback(
    (signal?: AbortSignal) =>
      requestApiJson(
        "/api/words/overview",
        wordsOverviewResponseSchema,
        { cache: "no-store", signal },
      ),
    [],
  );

  const handleLoadError = useCallback(
    (requestError: unknown, signal?: AbortSignal) => {
      if (signal?.aborted) {
        return;
      }

      setError(
        requestError instanceof ApiRequestError && requestError.status === 401
          ? t("profile.loadFailed")
          : t("words.all.failed"),
      );
    },
    [t],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadOverview(controller.signal)
      .then(setData)
      .then(() => setError(""))
      .catch((requestError: unknown) =>
        handleLoadError(requestError, controller.signal),
      );

    return () => controller.abort();
  }, [handleLoadError, loadOverview, retry]);

  useEffect(
    () =>
      subscribeToAccountDataChanged(() => {
        void loadOverview()
          .then(setData)
          .then(() => setError(""))
          .catch((requestError: unknown) => handleLoadError(requestError));
      }),
    [handleLoadError, loadOverview],
  );

  if (!data) {
    return (
      <div>
        {error ? (
          <div className={styles.error} role="alert">
            <p>{error}</p>
            <button onClick={() => setRetry((current) => current + 1)} type="button">
              {t("common.retry")}
            </button>
          </div>
        ) : (
          <>
            <WordsSummarySkeleton />
            <WordsPerformanceSkeleton />
            <WordsRecentSkeleton />
          </>
        )}
      </div>
    );
  }

  const average = new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Number(data.overview.average.replace(",", ".")));

  return (
    <div>
      <section
        aria-label={t("words.summary.aria")}
        className={styles.hero}
      >
        <small>{t("words.summary.label")}</small>
        <div className={styles.big}>
          <strong>{data.overview.total}</strong>
          <span>{t("words.summary.total")}</span>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>{data.overview.week}</strong>
            <span>{t("words.summary.week")}</span>
          </div>
          <div>
            <strong>{average}</strong>
            <span>{t("words.summary.average")}</span>
          </div>
          <div>
            <strong>{data.overview.bestDay}</strong>
            <span>{t("words.summary.best")}</span>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="words-performance-title"
        className={styles.section}
      >
        <h2 id="words-performance-title">
          {t("words.performance.title")}
        </h2>
        <WordsPerformance data={data.performance} />
      </section>

      <section aria-labelledby="recent-words-title" className={styles.section}>
        <h2 id="recent-words-title">{t("words.recent.title")}</h2>
        <RecentWords
          initialWords={data.recentWords}
          key={data.recentWords.map((word) => word.id).join(":")}
          total={data.overview.total}
        />
      </section>
    </div>
  );
}

export {
  WordsPerformanceSkeleton,
  WordsRecentSkeleton,
  WordsSummarySkeleton,
};
