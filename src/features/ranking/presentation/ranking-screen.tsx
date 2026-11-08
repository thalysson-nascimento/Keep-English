"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
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
  signal?: AbortSignal,
): Promise<z.output<TSchema>> {
  const response = await fetch(path, { cache: "no-store", signal });

  if (!response.ok) {
    throw new Error("Não foi possível carregar o ranking.");
  }

  const result: unknown = await response.json();
  const parsed = schema.safeParse(result);

  if (!parsed.success) {
    throw new Error("A resposta do ranking está em um formato inválido.");
  }

  return parsed.data;
}

async function fetchRankingData(signal?: AbortSignal): Promise<RankingData> {
  const [top, comparison, page] = await Promise.all([
    requestJson("/api/ranking/top", z.array(rankingEntrySchema), signal),
    requestJson("/api/ranking/compare", rankingComparisonSchema, signal),
    requestJson(
      `/api/ranking?offset=0&limit=${pageSize}`,
      rankingPageSchema,
      signal,
    ),
  ]);

  return { top, comparison, page };
}

function getDayLabel(dateKey: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(new Date(`${dateKey}T12:00:00`))
    .replace(".", "");
}

function RankingChart({ comparison }: { comparison: RankingComparison }) {
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
      aria-label="Pontos acumulados na semana"
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
          {getDayLabel(key)}
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

function RankingSkeleton() {
  return (
    <div aria-label="Carregando ranking" className={styles.loading}>
      <div className={`${styles.card} ${styles.podiumSkeleton}`} />
      <div className={`${styles.card} ${styles.comparisonSkeleton}`} />
      <div className={`${styles.card} ${styles.listSkeleton}`} />
    </div>
  );
}

function getPositionMessage(comparison: RankingComparison): string {
  const { me, others } = comparison;
  const neighbor = others[0];

  if (!neighbor) {
    return "Você está em 1º lugar! Continue acumulando pontos nesta semana.";
  }

  if (me.rank === 1) {
    return `Você lidera! Vantagem de ${me.total - neighbor.total} XP sobre ${neighbor.name}.`;
  }

  if (neighbor.rank < me.rank) {
    return `Você está em ${me.rank}º · faltam ${Math.max(1, neighbor.total - me.total + 1)} XP para passar ${neighbor.name}.`;
  }

  return `Você está em ${me.rank}º lugar nesta semana.`;
}

function Podium({ entries }: { entries: RankingEntry[] }) {
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
            aria-label={entry?.name ?? `${rank}º lugar aguardando participante`}
            className={`${styles.podiumAvatar} ${
              entry?.isCurrentUser ? styles.currentAvatar : ""
            }`}
          >
            {entry?.avatar ?? "·"}
          </div>
          <strong>
            {entry ? (entry.isCurrentUser ? "Você" : entry.name) : "Aguardando"}
          </strong>
          <span>{entry ? `${entry.total} XP` : "Sem participante"}</span>
          <div aria-label={`${rank}º lugar`} className={styles.block}>
            {rank}
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingRow({ entry }: { entry: RankingEntry }) {
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
          {entry.isCurrentUser ? " (você)" : ""}
        </strong>
        <span>Semana</span>
      </div>
      <strong className={styles.points}>{entry.total} XP</strong>
    </div>
  );
}

export function RankingScreen() {
  const [data, setData] = useState<RankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadRanking(signal?: AbortSignal) {
    setIsLoading(true);
    setError(null);

    try {
      const rankingData = await fetchRankingData(signal);

      if (!signal?.aborted) {
        setData(rankingData);
      }
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar o ranking.",
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
    void fetchRankingData(controller.signal)
      .then(setData)
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar o ranking.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

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
          : "Não foi possível carregar mais participantes.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return <RankingSkeleton />;
  }

  if (error && !data) {
    return (
      <div className={styles.error} role="alert">
        <p>{error}</p>
        <button onClick={() => void loadRanking()} type="button">
          Tentar novamente
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
      <p className={styles.intro}>
        🏆 Ranking semanal: 10 pontos por palavra nova e 5 por acerto no teste.
      </p>
      <section
        aria-label="Pódio semanal"
        className={`${styles.card} ${styles.podiumCard}`}
      >
        <Podium entries={data.top} />
      </section>

      <h1 className={styles.heading}>Sua posição</h1>
      <section className={styles.card}>
        <p className={styles.positionMessage}>
          {getPositionMessage(data.comparison)}
        </p>
        <small className={styles.subheading}>Pontos acumulados na semana</small>
        <RankingChart comparison={data.comparison} />
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
                {entry.isCurrentUser ? "Você" : entry.name.split(" ")[0]}
              </strong>
              <span>
                {entry.rank}º · {entry.total} XP
              </span>
            </div>
          ))}
        </div>
      </section>

      <h2 className={styles.heading}>Classificação geral</h2>
      <section
        aria-label="Classificação geral"
        className={`${styles.card} ${styles.rankingList}`}
      >
        {data.page.items.length > 0 ? (
          data.page.items.map((entry) => (
            <RankingRow entry={entry} key={entry.id} />
          ))
        ) : (
          <p className={styles.empty}>Ainda não há participantes no ranking.</p>
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
          {isLoadingMore ? "Carregando..." : "Carregar mais"}
        </button>
      )}
    </div>
  );
}
