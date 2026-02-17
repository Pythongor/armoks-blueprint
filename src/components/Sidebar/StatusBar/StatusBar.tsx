import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import styles from "./StatusBar.module.scss";

export function StatusBar() {
  const { x, y, biome } = useSelector((state: RootState) => state.coords);

  return (
    <div className={styles.statusBar}>
      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.label}>Biome:</span>
        {/* We use the raw biome string as the class key */}
        <span className={`${styles.biomeValue} ${styles[biome]}`}>
          {biome.replace(/([A-Z])/g, " $1").trim()}
        </span>
      </div>

      <div className={styles.divider} />

      <div className={styles.statusBar}>
        <div className={styles.section}>
          <span className={styles.label}>Pos:</span>
          <span className={styles.value}>
            {x}:{y}
          </span>
        </div>
      </div>
    </div>
  );
}
