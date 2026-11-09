"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { formatOrdinal, getIntlLocale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./ranking-screen.module.css";

const rankingEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  rank: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  days: z.array(z.number().int().nonnegative()).length(7),
  isCurrentUser: z.boolean(),
});
const rankingPageSchema = z.object({
  items: z.array(rankingEntrySchema),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});
const rankingComparisonSchema = z.object({
  me: rankingEntrySchema,
  others: z.array(rankingEntrySchema),
  dayKeys: z.array(z.string()).length(7),
});

type RankingEntry = z.infer<typeof rankingEntrySchema>;
type RankingPage = z.infer<typeof rankingPageSchema>;
type RankingComparison = z.infer<typeof rankingComparisonSchema>;

interface RankingData {
  top: RankingEntry[];
  comparison: RankingComparison;
  page: RankingPage;
}

const chartColors = ["#1cb0f6", "#ff9600", "#ff4b4b"];
const pageSize = 10;

async function requestJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  failureMessage: string,
  invalidMessage: string,
  signal?: AbortSignal,
): Promise<z.output<TSchema>> {
  let response: Response;

  try {
    response = await fetch(path, { cache: "no-store", signal });
  } catch {
    throw new Error(failureMessage);
  }

  if (!response.ok) {
    throw new Error(failureMessage);
  }

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    throw new Error(invalidMessage);
  }
  const parsed = schema.safeParse(result);

  if (!parsed.success) {
    throw new Error(invalidMessage);
  }

  return parsed.data;
}

async function fetchRankingData(
  failureMessage: string,
  invalidMessage: string,
  signal?: AbortSignal,
): Promise<RankingData> {
  const [top, comparison, page] = await Promise.all([
    requestJson(
      "/api/ranking/top",
      z.array(rankingEntrySchema),
      failureMessage,
      invalidMessage,
      signal,
    ),
    requestJson(
      "/api/ranking/compare",
      rankingComparisonSchema,
      failureMessage,
      invalidMessage,
      signal,
    ),
    requestJson(
      `/api/ranking?offset=0&limit=${pageSize}`,
      rankingPageSchema,
      failureMessage,
      invalidMessage,
      signal,
    ),
  ]);

  return { top, comparison, page };
}

function getDayLabel(dateKey: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short" })
    .format(new Date(`${dateKey}T12:00:00`))
    .replace(".", "");
}

function RankingChart({
  comparison,
  locale,
  label,
}: {
  comparison: RankingComparison;
  locale: string;
  label: string;
}) {
  const entries = [comparison.me, ...comparison.others];
  const cumulative = entries.map((entry) =>
    entry.days.map((_, index) =>
      entry.days.slice(0, index + 1).reduce((sum, points) => sum + points, 0),
    ),
  );
  const maximum = Math.max(10, ...cumulative.flat().map((points) => points));
  const x = (index: number) => 10 + (index * 318) / 6;
  const y = (points: number) => 10 + 126 * (1 - points / maximum);

  return (
    <svg
      aria-label={label}
      className={styles.chart}
      role="img"
      viewBox="0 0 340 170"
    >
      {[0, 0.5, 1].map((fraction) => {
        const lineY = y(maximum * fraction);
        return (
          <line
            key={fraction}
            x1="10"
            x2="328"
            y1={lineY}
            y2={lineY}
            stroke="var(--line)"
            strokeDasharray="4 5"
            strokeWidth="1.5"
          />
        );
      })}
      {comparison.dayKeys.map((key, index) => (
        <text
          key={key}
          x={x(index)}
          y="162"
          textAnchor="middle"
          className={styles.chartLabel}
        >
          {getDayLabel(key, locale)}
        </text>
      ))}
      {cumulative.map((points, entryIndex) => {
        const color = chartColors[entryIndex];
        const coordinates = points
          .map((value, index) => `${x(index)},${y(value)}`)
          .join(" ");

        return (
          <g key={entries[entryIndex].id}>
            <polyline
              fill="none"
              points={coordinates}
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={entryIndex === 0 ? 4.5 : 3.5}
            />
            {points.map((value, index) => (
              <circle
                key={`${entries[entryIndex].id}-${index}`}
                cx={x(index)}
                cy={y(value)}
                r={index === 6 ? 5.5 : 3}
                fill={color}
                stroke={index === 6 ? "var(--surface)" : undefined}
                strokeWidth={index === 6 ? 2 : undefined}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function RankingSkeleton({ label }: { label: string }) {
  return (
    <div aria-label={label} className={styles.loading}>
      <div className={`${styles.card} ${styles.podiumSkeleton}`} />
      <div className={`${styles.card} ${styles.comparisonSkeleton}`} />
      <div className={`${styles.card} ${styles.listSkeleton}`} />
    </div>
  );
}

function getPositionMessage(
  comparison: RankingComparison,
  locale: "pt-BR" | "en",
  t: ReturnType<typeof useI18n>["t"],
): string {
  const { me, others } = comparison;
  const neighbor = others[0];

  if (!neighbor) {
    return t("ranking.position.leading");
  }

  if (me.rank === 1) {
    return t("ranking.position.lead", {
      points: me.total - neighbor.total,
      name: neighbor.name,
    });
  }

  if (neighbor.rank < me.rank) {
    return t("ranking.position.catchUp", {
      rank: formatOrdinal(locale, me.rank),
      points: Math.max(1, neighbor.total - me.total + 1),
      name: neighbor.name,
    });
  }

  return t("ranking.position.current", {
    rank: formatOrdinal(locale, me.rank),
  });
}

function Podium({
  entries,
  locale,
  t,
}: {
  entries: RankingEntry[];
  locale: "pt-BR" | "en";
  t: ReturnType<typeof useI18n>["t"];
}) {
  const places = [2, 1, 3].map((rank) => ({
    rank,
    entry: entries.find((entry) => entry.rank === rank),
  }));

  return (
    <div className={styles.podium}>
      {places.map(({ rank, entry }) => (
        <div
          className={`${styles.podiumEntry} ${styles[`place${rank}`]} ${
            entry ? "" : styles.podiumPlaceholder
          }`}
          key={rank}
        >
          {rank === 1 && (
            <span aria-hidden="true" className={styles.crown}>
              👑
            </span>
          )}
          <div
            aria-label={
              entry?.name ??
              `${formatOrdinal(locale, rank)} ${t("ranking.emptyPlace")}`
            }
            className={`${styles.podiumAvatar} ${
              entry?.isCurrentUser ? styles.currentAvatar : ""
            }`}
          >
            {entry?.avatar ?? "·"}
          </div>
          <strong>
            {entry
              ? entry.isCurrentUser
                ? t("common.currentUser")
                : entry.name
              : t("ranking.emptyPlace")}
          </strong>
          <span>
            {entry ? `${entry.total} XP` : t("ranking.noParticipant")}
          </span>
          <div
            aria-label={formatOrdinal(locale, rank)}
            className={styles.block}
          >
            {rank}
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingRow({
  entry,
  t,
}: {
  entry: RankingEntry;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const medal = ["🥇", "🥈", "🥉"][entry.rank - 1];

  return (
    <div
      className={`${styles.row} ${
        entry.isCurrentUser ? styles.currentRow : ""
      }`}
    >
      <strong className={styles.rankPosition}>{medal ?? entry.rank}</strong>
      <div aria-hidden="true" className={styles.rowAvatar}>
        {entry.avatar}
      </div>
      <div className={styles.userDetails}>
        <strong>
          {entry.name}
          {entry.isCurrentUser
            ? ` (${t("common.currentUser").toLowerCase()})`
            : ""}
        </strong>
        <span>{t("ranking.week")}</span>
      </div>
      <strong className={styles.points}>{entry.total} XP</strong>
    </div>
  );
}

export function RankingScreen() {
  const { locale, t } = useI18n();
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadRanking(signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);

    try {
      const rankingData = await fetchRankingData(
        t("ranking.failed"),
        t("ranking.invalidResponse"),
        signal,
      );

      if (!signal?.aborted) {
        setData(rankingData);
      }
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : t("ranking.failed"),
        );
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    void fetchRankingData(
      t("ranking.failed"),
      t("ranking.invalidResponse"),
      controller.signal,
    )
      .then(setData)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : t("ranking.failed"),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [t]);

  async function loadMore() {
    if (!data || isLoadingMore || !data.page.hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await requestJson(
        `/api/ranking?offset=${data.page.items.length}&limit=${pageSize}`,
        rankingPageSchema,
        t("ranking.failed"),
        t("ranking.invalidResponse"),
      );
      setData((current) =>
        current
          ? {
              ...current,
              page: {
                ...nextPage,
                items: [...current.page.items, ...nextPage.items],
              },
            }
          : current,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("ranking.moreFailed"),
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return <RankingSkeleton label={t("ranking.loadAria")} />;
  }

  if (error && !data) {
    return (
      <div className={styles.error} role="alert">
        <p>{error}</p>
        <button onClick={() => void loadRanking()} type="button">
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const comparisonEntries = [data.comparison.me, ...data.comparison.others];

  return (
    <div className={styles.screen}>
      <p className={styles.intro}>{t("ranking.intro")}</p>
      <section
        aria-label={t("ranking.podium")}
        className={`${styles.card} ${styles.podiumCard}`}
      >
        <Podium entries={data.top} locale={locale} t={t} />
      </section>

      <h1 className={styles.heading}>{t("ranking.yourPosition")}</h1>
      <section className={styles.card}>
        <p className={styles.positionMessage}>
          {getPositionMessage(data.comparison, locale, t)}
        </p>
        <small className={styles.subheading}>
          {t("ranking.pointsThisWeek")}
        </small>
        <RankingChart
          comparison={data.comparison}
          label={t("ranking.chartAria")}
          locale={getIntlLocale(locale)}
        />
        <div className={styles.legend}>
          {comparisonEntries.map((entry, index) => (
            <div className={styles.legendEntry} key={entry.id}>
              <span
                className={styles.legendAvatar}
                style={{ borderColor: chartColors[index] }}
              >
                {entry.avatar}
              </span>
              <strong>
                {entry.isCurrentUser
                  ? t("common.currentUser")
                  : entry.name.split(" ")[0]}
              </strong>
              <span>
                {formatOrdinal(locale, entry.rank)} · {entry.total} XP
              </span>
            </div>
          ))}
        </div>
      </section>

      <h2 className={styles.heading}>{t("ranking.general")}</h2>
      <section
        aria-label={t("ranking.general")}
        className={`${styles.card} ${styles.rankingList}`}
      >
        {data.page.items.length > 0 ? (
          data.page.items.map((entry) => (
            <RankingRow entry={entry} key={entry.id} t={t} />
          ))
        ) : (
          <p className={styles.empty}>{t("ranking.empty")}</p>
        )}
      </section>
      {error && (
        <p className={styles.paginationError} role="alert">
          {error}
        </p>
      )}
      {data.page.hasMore && (
        <button
          className={styles.loadMore}
          disabled={isLoadingMore}
          onClick={() => void loadMore()}
          type="button"
        >
          {isLoadingMore ? t("ranking.loadingMore") : t("ranking.loadMore")}
        </button>
      )}
    </div>
  );
}
