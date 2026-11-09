import { getRequestLocale } from "@/shared/i18n/server";
import { translate } from "@/shared/i18n/messages";
import styles from "./placeholder-page.module.css";

interface PlaceholderPageProps {
  title: string;
}

export async function PlaceholderPage({ title }: PlaceholderPageProps) {
  const locale = await getRequestLocale();

  return (
    <section className={styles.page} aria-labelledby="placeholder-page-title">
      <h1 className={styles.title} id="placeholder-page-title">
        {title}
      </h1>
      <p className={styles.message}>{translate(locale, "common.comingSoon")}</p>
    </section>
  );
}
