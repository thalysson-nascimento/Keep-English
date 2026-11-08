"use client";

import { useState } from "react";
import type { WordPerformancePeriod } from "@/features/words/application/get-words-overview";
import styles from "./words-screen.module.css";

interface WordsPerformanceProps {
  data: {
    sevenDays: WordPerformancePeriod;
    fourteenDays: WordPerformancePeriod;
  };
}

export function WordsPerformance({ data }: WordsPerformanceProps) {
  const [range, setRange] = useState<7 | 14>(7);
  const period = range === 7 ? data.sevenDays : data.fourteenDays;
  const scale = Math.max(1, ...period.days.map((day) => day.count));

  return (
    <div className={`${styles.card} ${styles.performance}`}>
      <div className={styles.performanceHeader}>
        <h3>Palavras por dia</h3>
        <div aria-label="Período do gráfico" className={styles.rangeToggle}>
          <button
            aria-pressed={range === 7}
            className={range === 7 ? styles.rangeActive : ""}
            onClick={() => setRange(7)}
            type="button"
          >
            7 dias
          </button>
          <button
            aria-pressed={range === 14}
            className={range === 14 ? styles.rangeActive : ""}
            onClick={() => setRange(14)}
            type="button"
          >
            14 dias
          </button>
        </div>
      </div>

      <div className={styles.performanceStats}>
        <div>
          <strong>{period.total}</strong>
          <span>Total</span>
        </div>
        <div>
          <strong>{period.average}</strong>
          <span>Média/dia</span>
        </div>
        <div>
          <strong>{period.bestDay}</strong>
          <span>Melhor dia</span>
        </div>
      </div>

      <div
        aria-label={`Palavras anotadas por dia nos últimos ${range} dias`}
        className={styles.performanceChart}
        role="img"
      >
        {period.days.map((day, index) => {
          const height = Math.round((day.count / scale) * 100);
          const isToday = index === period.days.length - 1;

          return (
            <div className={styles.chartColumn} key={day.date}>
              <span>{day.count || ""}</span>
              <div className={styles.chartBarTrack}>
                <i
                  className={isToday ? styles.todayBar : ""}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span>{range === 7 ? day.label7 : day.label14}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
