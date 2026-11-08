import type { TestsOverviewData } from "@/features/tests/application/get-tests-overview";
import styles from "./tests-screen.module.css";
import { TestStartButton } from "./test-start-button";

interface TestsScreenProps {
  data: TestsOverviewData;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  return `${day} às ${time}`;
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

function EmptyTests() {
  return (
    <div className={styles.empty}>
      <span aria-hidden="true">🎯</span>
      <p>
        Nenhum teste ainda.
        <br />
        Faça o primeiro para ver sua evolução!
      </p>
    </div>
  );
}

export function TestsScreen({ data }: TestsScreenProps) {
  const recentChartRecords = data.records.slice(0, 6).reverse();
  const chartRecords = Array.from({ length: 6 }, (_, index) => {
    const recordIndex = index - (6 - recentChartRecords.length);

    return recordIndex >= 0 ? recentChartRecords[recordIndex] : null;
  });
  const recentRecords = data.records.slice(0, 10);

  return (
    <div className={styles.screen}>
      <section
        aria-label="Resumo dos testes realizados"
        className={styles.hero}
      >
        <small>TESTES REALIZADOS</small>
        <div className={styles.total}>
          <strong>{data.total}</strong>
          <span>no total</span>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>
              {data.bestScore === null ? "–" : `${data.bestScore}%`}
            </strong>
            <span>Melhor nota</span>
          </div>
          <div>
            <strong>
              {data.averageScore === null ? "–" : `${data.averageScore}%`}
            </strong>
            <span>Média</span>
          </div>
          <div>
            <strong>
              {data.latestScore === null ? "–" : `${data.latestScore}%`}
            </strong>
            <span>Último</span>
          </div>
        </div>
      </section>

      <TestStartButton access={data.access} />

      <section
        aria-labelledby="test-evolution-title"
        className={styles.section}
      >
        <h2 id="test-evolution-title">Evolução das notas</h2>
        <div className={styles.card}>
          <div
            aria-label="Notas dos últimos seis testes; barras cinzas indicam testes ainda não realizados"
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
                  <span>{record ? formatDate(record.completedAt) : ""}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="test-history-title" className={styles.section}>
        <h2 id="test-history-title">Histórico</h2>
        <div className={styles.card}>
          {recentRecords.length === 0 ? (
            <EmptyTests />
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
                        {record.score}/{record.total} acertos
                      </strong>
                      <span>{formatDateTime(record.completedAt)}</span>
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

export function TestsScreenSkeleton() {
  return (
    <div
      aria-label="Carregando testes"
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
