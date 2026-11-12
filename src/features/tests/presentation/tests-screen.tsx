"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TestsOverviewData } from "@/features/tests/application/get-tests-overview";
import { testsOverviewResponseSchema } from "@/features/tests/application/tests-api.schema";
import {
  ApiRequestError,
  requestApiJson,
} from "@/shared/lib/api-client";
import { getIntlLocale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./tests-screen.module.css";
import { TestStartButton } from "./test-start-button";

type Translator = ReturnType<typeof useI18n>["t"];

function formatDate(timestamp: number, locale: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function formatDateTime(
  timestamp: number,
  locale: string,
  t: Translator,
): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const time = date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return t("testOverview.dateTime", { date: day, time });
}

function getResultIcon(percentage: number): string {
  if (percentage >= 80) {
    return "🏆";
  }

  return percentage >= 60 ? "👏" : "💪";
}

function getChartColor(percentage: number): string {
  if (percentage >= 80) {
    return styles.greenBar;
  }

  return percentage >= 60 ? styles.blueBar : styles.orangeBar;
}

function EmptyTests({ t }: { t: Translator }) {
  return (
    <div className={styles.empty}>
      <span aria-hidden="true">🎯</span>
      <p>
        {t("testOverview.empty")
          .split("\n")
          .map((line, index) => (
            <span key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
      </p>
    </div>
  );
}

function TestsOverview({ data }: { data: TestsOverviewData }) {
  const { locale, t } = useI18n();
  const intlLocale = getIntlLocale(locale);
  const recentChartRecords = data.records.slice(0, 6).reverse();
  const chartRecords = Array.from({ length: 6 }, (_, index) => {
    const recordIndex = index - (6 - recentChartRecords.length);

    return recordIndex >= 0 ? recentChartRecords[recordIndex] : null;
  });
  const recentRecords = data.records.slice(0, 10);

  return (
    <div className={styles.screen}>
      <section aria-label={t("testOverview.aria")} className={styles.hero}>
        <small>{t("testOverview.summary")}</small>
        <div className={styles.total}>
          <strong>{data.total}</strong>
          <span>{t("testOverview.total")}</span>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>
              {data.bestScore === null ? "–" : `${data.bestScore}%`}
            </strong>
            <span>{t("testOverview.best")}</span>
          </div>
          <div>
            <strong>
              {data.averageScore === null ? "–" : `${data.averageScore}%`}
            </strong>
            <span>{t("testOverview.average")}</span>
          </div>
          <div>
            <strong>
              {data.latestScore === null ? "–" : `${data.latestScore}%`}
            </strong>
            <span>{t("testOverview.latest")}</span>
          </div>
        </div>
      </section>

      <TestStartButton access={data.access} />

      <section
        aria-labelledby="test-evolution-title"
        className={styles.section}
      >
        <h2 id="test-evolution-title">{t("testOverview.evolution")}</h2>
        <div className={styles.card}>
          <div
            aria-label={t("testOverview.chartAria")}
            className={styles.chart}
            role="img"
          >
            {chartRecords.map((record, index) => {
              const percentage = record
                ? Math.round((record.score / record.total) * 100)
                : null;

              return (
                <div
                  className={`${styles.chartColumn} ${
                    percentage === null
                      ? styles.emptyColumn
                      : getChartColor(percentage)
                  }`}
                  key={record?.id ?? `empty-${index}`}
                >
                  <span>{percentage === null ? "" : `${percentage}%`}</span>
                  <div className={styles.barTrack}>
                    <i
                      style={{
                        height:
                          percentage === null
                            ? "5px"
                            : `${Math.max(percentage, 4)}%`,
                      }}
                    />
                  </div>
                  <span>
                    {record ? formatDate(record.completedAt, intlLocale) : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="test-history-title" className={styles.section}>
        <h2 id="test-history-title">{t("testOverview.history")}</h2>
        <div className={styles.card}>
          {recentRecords.length === 0 ? (
            <EmptyTests t={t} />
          ) : (
            <ul className={styles.history}>
              {recentRecords.map((record) => {
                const percentage = Math.round(
                  (record.score / record.total) * 100,
                );

                return (
                  <li className={styles.historyItem} key={record.id}>
                    <span aria-hidden="true" className={styles.resultIcon}>
                      {getResultIcon(percentage)}
                    </span>
                    <div className={styles.resultDescription}>
                      <strong>
                        {t("testOverview.correctAnswers", {
                          score: record.score,
                          total: record.total,
                        })}
                      </strong>
                      <span>
                        {formatDateTime(record.completedAt, intlLocale, t)}
                      </span>
                    </div>
                    <strong className={styles.percentage}>{percentage}%</strong>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export function TestsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [data, setData] = useState<TestsOverviewData | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void requestApiJson(
      "/api/tests",
      testsOverviewResponseSchema,
      { cache: "no-store", signal: controller.signal },
    )
      .then(setData)
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        if (
          requestError instanceof ApiRequestError &&
          requestError.status === 401
        ) {
          router.replace("/login");
          return;
        }

        setError(true);
      });

    return () => controller.abort();
  }, [retry, router]);

  if (data) {
    return <TestsOverview data={data} />;
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>{t("testOverview.loadFailed")}</p>
        <button
          onClick={() => {
            setError(false);
            setRetry((current) => current + 1);
          }}
          type="button"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return <TestsScreenSkeleton />;
}

export function TestsScreenSkeleton() {
  const { t } = useI18n();

  return (
    <div
      aria-label={t("testOverview.loadingAria")}
      aria-busy="true"
      className={styles.screen}
      role="status"
    >
      <section className={`${styles.hero} ${styles.skeletonHero}`}>
        <span className={styles.skeletonLabel} />
        <span className={styles.skeletonTotal} />
        <div className={styles.skeletonStats}>
          <span />
          <span />
          <span />
        </div>
      </section>
      <div className={styles.skeletonButton} />
      <section className={styles.section}>
        <span className={styles.skeletonHeading} />
        <div className={styles.card}>
          <div className={styles.skeletonChart} />
        </div>
      </section>
      <section className={styles.section}>
        <span className={styles.skeletonHeading} />
        <div className={styles.card}>
          <span className={styles.skeletonHistory} />
          <span className={styles.skeletonHistory} />
          <span className={styles.skeletonHistory} />
        </div>
      </section>
    </div>
  );
}
