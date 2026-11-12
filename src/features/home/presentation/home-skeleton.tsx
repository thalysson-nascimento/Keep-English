"use client";

import { useI18n } from "@/shared/i18n/locale-provider";
import styles from "./home-screen.module.css";

export function HomeSkeleton() {
  const { t } = useI18n();
  return (
    <div
      aria-busy="true"
      aria-label={t("common.loadingHome")}
      className={styles.home}
    >
      <span className={styles.skeletonHeading} />
      <section className={styles.hero}>
        <span className={styles.skeletonText} />
        <span className={styles.skeletonNumber} />
        <div className={styles.skeletonStats}>
          <span />
          <span />
          <span />
        </div>
      </section>
      <section className={styles.section}>
        <span className={styles.skeletonHeading} />
        <div className={styles.card}>
          <div className={styles.skeletonWord} />
          <div className={styles.skeletonWord} />
          <div className={styles.skeletonWord} />
        </div>
      </section>
    </div>
  );
}
