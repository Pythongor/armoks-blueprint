import styles from "./Header.module.scss";

export function Header() {
  return (
    <header>
      <h1 className={styles.glitchTitle}>
        <span className={styles.qualitySymbol}>≡</span>☼ ARMOK'S BLUEPRINT ☼
        <span className={styles.qualitySymbol}>≡</span>
      </h1>
    </header>
  );
}
