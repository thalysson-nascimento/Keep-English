import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import styles from "./home-screen.module.css";

export async function HomeSkeleton() {
  const locale = await getRequestLocale();

  return (
    <div
      aria-busy="true"
      aria-label={translate(locale, "common.loadingHome")}
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
