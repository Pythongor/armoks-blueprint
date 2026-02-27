import { useSelector } from "react-redux";
import cn from "classnames";
import { type RootState } from "@store/index";
import styles from "./StatusBar.module.scss";
import { formatBiomeDescriptor, formatBiomeText } from "@helpers/biomeResolver";

export function StatusBar() {
  const { x, y, biome, biomeDescriptor } = useSelector(
    (state: RootState) => state.coords,
  );

  const formattedX = x.toString().padStart(3, "0");
  const formattedY = y.toString().padStart(3, "0");

  const descriptorClass = formatBiomeDescriptor(biomeDescriptor);

  return (
    <div className={styles.statusBar}>
      <div className={styles.section}>
        <span className={styles.label}>COORD:</span>
        <span className={styles.value}>
          {formattedX} : {formattedY}
        </span>
      </div>

      <div className={styles.divider} />

      <div className={cn(styles.section, styles.biomeSection)}>
        <span className={styles.label}>REGION:</span>
        <div className={styles.contentGroup}>
          <span className={cn(styles.descriptor, styles[descriptorClass])}>
            {biomeDescriptor?.replace("_", " ")}
          </span>{" "}
          <span className={cn(styles.biomeValue, styles[biome])}>
            {formatBiomeText(biome)}
          </span>
        </div>
      </div>
    </div>
  );
}
