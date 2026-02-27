import { JsonToWorldGen } from "@utils/JsonToWorldGen";
import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { useState } from "react";
import cn from "classnames";
import styles from "./Cards.module.scss";

export function WorldGenCard() {
  const { presets } = useSelector((state: RootState) => state.world);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (progress > 0) return;

    setProgress(1);

    try {
      await JsonToWorldGen.export(presets, (p) => {
        setProgress(p);
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const isExporting = progress > 0;

  return (
    <section className={styles.exportCard}>
      <div className={styles.cardInfo}>
        <h3>World Gen Parameters</h3>
        <p>Export your tokens and logic settings into a world_gen.txt file.</p>
      </div>

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
          {progress === 0 && "DOWNLOAD BLUEPRINT"}
          {progress > 0 && progress < 100 && `ENGRAVING... ${progress}%`}
          {progress === 100 && "SUCCESS!"}
        </span>
      </button>
    </section>
  );
}
