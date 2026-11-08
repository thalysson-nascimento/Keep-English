import styles from "./placeholder-page.module.css";

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className={styles.page} aria-labelledby="placeholder-page-title">
      <h1 className={styles.title} id="placeholder-page-title">
        {title}
      </h1>
      <p className={styles.message}>Em construção</p>
    </section>
  );
}
