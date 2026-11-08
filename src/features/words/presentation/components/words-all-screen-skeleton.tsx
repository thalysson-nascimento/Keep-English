import styles from "./all-words-screen.module.css";

export function WordsAllScreenSkeleton() {
  return (
    <div className={styles.screen}>
      <div
        aria-label="Carregando todas as palavras"
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
