import styles from "./home-screen.module.css";

export function HomeSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando início"
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
