import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.base}>
      <span className={styles.version}>v0.0.1</span>
      <span className={styles.separator}> | </span>
      <span className={styles.qualityText}>"It is terrifying."</span>
      <span className={styles.separator}> — </span>
      <span className={styles.artifactDesc}>
        All craftsdwarfship is of the{" "}
        <span className={styles.legendary}>highest quality</span>.
      </span>
    </footer>
  );
}
