import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import styles from "./all-words-screen.module.css";

export async function WordsAllScreenSkeleton() {
  const locale = await getRequestLocale();

  return (
    <div className={styles.screen}>
      <div
        aria-label={translate(locale, "common.loadingWords")}
        aria-busy="true"
        className={styles.wrap}
        role="status"
      >
        <span className={styles.skeletonHeader} />
        <span className={styles.skeletonSearch} />
        <div className={styles.card}>
          {[0, 1, 2, 3].map((item) => (
            <div className={styles.skeletonWord} key={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
