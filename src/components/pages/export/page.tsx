import { ImageExporter } from "@utils/ImageExporter";
import cn from "classnames";
import styles from "./page.module.scss";
import { useState } from "react";

export const ExportPage = () => {
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
    <div className={styles.vaultContainer}>
      <header className={styles.vaultHeader}>
        <span className={styles.qualitySymbol}>≡</span>
        <h2>THE EXPORT VAULT</h2>
        <span className={styles.qualitySymbol}>≡</span>
      </header>

      <div className={styles.exportGrid}>
        <section className={`${styles.exportCard} ${styles.disabled}`}>
          <div className={styles.cardInfo}>
            <h3>World Gen Parameters</h3>
            <p>
              Export your tokens and logic settings into a world_gen.txt file.
            </p>
          </div>
          <button disabled>LOCKED IN ARCHIVE</button>
        </section>

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
                {isExporting
                  ? `ENGRAVING... ${progress}%`
                  : "DOWNLOAD HEIGHTMAP"}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
