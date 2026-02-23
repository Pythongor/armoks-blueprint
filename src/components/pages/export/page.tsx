import { ImageExporter } from "@utils/ImageExporter";
import styles from "./page.module.scss";

export const ExportPage = () => {
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
            <p>
              Extract the elevation strata as a high-fidelity bitmap. Compatible
              with the PerfectWorld utility for advanced biome simulation.
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={styles.exportButton}
              onClick={() => ImageExporter.exportElevationForPerfectWorld()}
            >
              DOWNLOAD HEIGHTMAP
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
