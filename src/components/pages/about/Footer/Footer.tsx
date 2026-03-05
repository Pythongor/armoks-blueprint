import styles from "./Footer.module.scss";

export function Footer() {
  return (
    <footer className={styles.base}>
      <a
        className={styles.link}
        href="https://github.com/Pythongor/armoks-blueprint"
        target="_blank"
      >
        [ STUDY THE SOURCE SCROLLS (GITHUB) ]
      </a>
      <div className={styles.versionBadge}>VERSION 0.1.0</div>
    </footer>
  );
}
