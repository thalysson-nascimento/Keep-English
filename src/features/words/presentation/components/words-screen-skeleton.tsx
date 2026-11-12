"use client";

import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./words-screen.module.css";

export function WordsSummarySkeleton() {
  const { t } = useI18n();
  return (
    <section
      aria-label={t("words.summary.aria")}
      aria-busy="true"
      className={`${styles.hero} ${styles.skeletonHero}`}
      role="status"
    >
      <span className={styles.skeletonLabel} />
      <span className={styles.skeletonTotal} />
      <div className={styles.skeletonStats}>
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}

export function WordsPerformanceSkeleton() {
  const { t } = useI18n();
  return (
    <section
      aria-label={t("words.performance.title")}
      aria-busy="true"
      className={styles.section}
      role="status"
    >
      <span className={styles.skeletonHeading} />
      <div className={`${styles.card} ${styles.performance}`}>
        <div className={styles.skeletonPerformanceHeader} />
        <div className={styles.skeletonPerformanceStats}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.skeletonChart}>
          {[0, 1, 2, 3, 4, 5, 6].map((item) => (
            <span key={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function WordsRecentSkeleton() {
  const { t } = useI18n();
  return (
    <section
      aria-label={t("words.recent.title")}
      aria-busy="true"
      className={styles.section}
      role="status"
    >
      <span className={styles.skeletonHeading} />
      <div className={styles.card}>
        {[0, 1, 2].map((item) => (
          <div className={styles.skeletonWord} key={item} />
        ))}
      </div>
    </section>
  );
}
