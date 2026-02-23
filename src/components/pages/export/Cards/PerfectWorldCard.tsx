import { ImageExporter } from "@utils/ImageExporter";
import cn from "classnames";
import styles from "./Cards.module.scss";
import { useState } from "react";

export function PerfectWorldCard() {
  const [progress, setProgress] = useState(0);
  const isExporting = progress > 0 && progress < 100;

  const handleExport = async () => {
    setProgress(1);
    await ImageExporter.exportAllElevationForPerfectWorld((p) =>
      setProgress(p),
    );
    setTimeout(() => setProgress(0), 1000);
  };

  return (
    <section className={styles.exportCard}>
      <div className={styles.cardInfo}>
        <h3>PerfectWorld Heightmap</h3>
        <p>Extract the elevation strata as a high-fidelity bitmap...</p>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={cn(styles.exportButton, isExporting && styles.loading)}
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting && (
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            />
          )}
          <span className={styles.btnText}>
            {isExporting ? `ENGRAVING... ${progress}%` : "DOWNLOAD HEIGHTMAP"}
          </span>
        </button>
      </div>
    </section>
  );
}
