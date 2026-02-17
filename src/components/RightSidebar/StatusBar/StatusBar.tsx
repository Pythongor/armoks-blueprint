import { useSelector } from "react-redux";
import cn from "classnames";
import { type RootState } from "@store/index";
import styles from "./StatusBar.module.scss";

export function StatusBar() {
  const { x, y, biome, biomeDescriptor } = useSelector(
    (state: RootState) => state.coords,
  );

  const descriptorClass = biomeDescriptor.replace(/\s+/g, "_");

  return (
    <div className={styles.statusBar}>
      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.label}>Biome:</span>
        <span className={cn(styles.descriptor, styles[descriptorClass])}>
          {biomeDescriptor}
        </span>
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
