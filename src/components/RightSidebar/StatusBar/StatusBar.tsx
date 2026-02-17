import { useSelector } from "react-redux";
import cn from "classnames";
import { type RootState } from "@store/index";
import styles from "./StatusBar.module.scss";
import { formatBiomeDescriptor, formatBiomeText } from "@helpers/biomeResolver";

export function StatusBar() {
  const { x, y, biome, biomeDescriptor } = useSelector(
    (state: RootState) => state.coords,
  );

  const descriptorClass = formatBiomeDescriptor(biomeDescriptor);

  return (
    <div className={styles.statusBar}>
      <div className={styles.divider} />

      <div className={styles.section}>
        <span className={styles.label}>Biome:</span>
        <span className={cn(styles.descriptor, styles[descriptorClass])}>
          {biomeDescriptor}
        </span>
        <span className={`${styles.biomeValue} ${styles[biome]}`}>
          {formatBiomeText(biome)}
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
