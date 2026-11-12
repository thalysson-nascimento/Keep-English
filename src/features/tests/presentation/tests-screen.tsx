import type { TestsOverviewData } from "@/features/tests/application/get-tests-overview";
import { getIntlLocale } from "@/shared/i18n/config";
import { getRequestLocale } from "@/shared/i18n/server";
import {
  translate,
  type TranslationKey,
  type TranslationValues,
} from "@/shared/i18n/messages";
import styles from "./tests-screen.module.css";
import { TestStartButton } from "./test-start-button";

interface TestsScreenProps {
  data: TestsOverviewData;
}

type Translator = (key: TranslationKey, values?: TranslationValues) => string;

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

export async function TestsScreen({ data }: TestsScreenProps) {
  const locale = await getRequestLocale();
  const t: Translator = (key, values) => translate(locale, key, values);
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

export async function TestsScreenSkeleton() {
  const locale = await getRequestLocale();

  return (
    <div
      aria-label={translate(locale, "testOverview.loadingAria")}
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
