import { useCallback, useState } from "react";

import { WorldGenToUniversalJson } from "@utils/WorldGenParser";
import styles from "../Cards.module.scss";
import { useWorldInitializer } from "../hooks";

export function ReclaimArchiveCard() {
  const handleStart = useWorldInitializer();
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      const parsedData = WorldGenToUniversalJson.parse(text);
      handleStart(parsedData, parsedData.dimensions?.width || 129);
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
      className={`${styles.card} ${dragActive ? styles.active : ""}`}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
    >
      <h3>RECLAIM ARCHIVE</h3>
      <p>Upload a world_gen.txt to resume your design.</p>
      <label className={styles.fileLabel}>
        BROWSE FILE
        <input type="file" accept=".txt" onChange={handleFileUpload} hidden />
      </label>
    </div>
  );
}
