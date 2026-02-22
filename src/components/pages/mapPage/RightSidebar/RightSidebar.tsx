import { CompositeToggle } from "../CompositeToggle/CompositeToggle";
import { ImageExporter } from "@utils/ImageExporter";
import { StatusBar } from "../StatusBar/StatusBar";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <CompositeToggle />
      </section>

      <div className={styles.divider} />
      <div className={styles.buttonGroup}>
        <button
          className={styles.exportButton}
          onClick={() => ImageExporter.exportElevationForPerfectWorld()}
        >
          Export PerfectWorld Heightmap
        </button>
      </div>

      <div className={styles.divider} />
      <StatusBar />
    </div>
  );
}
