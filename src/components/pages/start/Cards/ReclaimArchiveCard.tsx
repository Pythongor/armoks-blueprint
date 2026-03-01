import { useCallback, useState } from "react";

import { WorldGenToJson } from "@/utils/WorldGenToJson";
import cn from "classnames";
import styles from "./Cards.module.scss";
import { useWorldInitializer } from "./hooks";

export function ReclaimArchiveCard() {
  const handleStart = useWorldInitializer(true);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const text = await file.text();
        const allPresets = WorldGenToJson.parse(text);

        handleStart(allPresets);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "The scroll is unreadable.");
        }
      }
    },
    [handleStart],
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile],
  );

  return (
    <div
      className={cn(
        styles.card,
        styles.reclaimCard,
        dragActive && styles.card__dragActive,
        error && styles.card__error,
      )}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
      onClick={() => error && setError(null)}
    >
      {dragActive ? (
        <div className={styles.dropZoneIndicator}>
          <h3>DROP WORLD_GEN.TXT HERE</h3>
          <p>The archives are ready to be unrolled...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContent}>
          <h3 className={styles.errorTitle}>ARCHIVE CORRUPTED</h3>
          <p className={styles.errorMessage}>{error}</p>
          <span className={styles.retryHint}>Click to try another scroll</span>
        </div>
      ) : (
        <>
          <div className={styles.cardHeader}>
            <h3>RECLAIM ARCHIVE</h3>
            <p>Unroll a world_gen.txt to restore all saved blueprints.</p>
          </div>

          <label className={styles.fileLabel}>
            RESTORE FROM SCROLL
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              hidden
            />
          </label>
        </>
      )}
    </div>
  );
}
