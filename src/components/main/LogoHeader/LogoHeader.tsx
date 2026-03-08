import styles from "./LogoHeader.module.scss";

export function LogoHeader() {
  return (
    <h1 className={styles.base}>
      <span className={styles.qualitySymbol}>≡</span>
      <span className={styles.glitchTitle}>☼ ARMOK'S BLUEPRINT ☼</span>
      <span className={styles.qualitySymbol}>≡</span>
    </h1>
  );
}
