"use client";

import { useState } from "react";
import type { WordPerformancePeriod } from "@/features/words/application/get-words-overview";
import { getIntlLocale } from "@/shared/i18n/config";
import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./words-screen.module.css";

interface WordsPerformanceProps {
  data: {
    sevenDays: WordPerformancePeriod;
    fourteenDays: WordPerformancePeriod;
  };
}

export function WordsPerformance({ data }: WordsPerformanceProps) {
  const { locale, t } = useI18n();
  const [range, setRange] = useState<7 | 14>(7);
  const period = range === 7 ? data.sevenDays : data.fourteenDays;
  const scale = Math.max(1, ...period.days.map((day) => day.count));
  const average = new Intl.NumberFormat(getIntlLocale(locale), {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(Number(period.average.replace(",", ".")));

  return (
    <div className={`${styles.card} ${styles.performance}`}>
      <div className={styles.performanceHeader}>
        <h3>{t("words.performance.chartTitle")}</h3>
        <div
          aria-label={t("words.performance.range")}
          className={styles.rangeToggle}
        >
          <button
            aria-pressed={range === 7}
            className={range === 7 ? styles.rangeActive : ""}
            onClick={() => setRange(7)}
            type="button"
          >
            {t("words.performance.days", { count: 7 })}
          </button>
          <button
            aria-pressed={range === 14}
            className={range === 14 ? styles.rangeActive : ""}
            onClick={() => setRange(14)}
            type="button"
          >
            {t("words.performance.days", { count: 14 })}
          </button>
        </div>
      </div>

      <div className={styles.performanceStats}>
        <div>
          <strong>{period.total}</strong>
          <span>{t("common.total")}</span>
        </div>
        <div>
          <strong>{average}</strong>
          <span>{t("common.averagePerDay")}</span>
        </div>
        <div>
          <strong>{period.bestDay}</strong>
          <span>{t("common.bestDay")}</span>
        </div>
      </div>

      <div
        aria-label={t("words.performance.chartAria", { count: range })}
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
              <span>
                {range === 7
                  ? new Intl.DateTimeFormat(getIntlLocale(locale), {
                      weekday: "narrow",
                    }).format(new Date(`${day.date}T12:00:00.000Z`))
                  : day.label14}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
