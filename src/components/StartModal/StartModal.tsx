import React, { useState } from "react";

import {
  WorldGenToUniversalJson,
  type DFWorldJson,
} from "@utils/WorldGenParser";
import styles from "./StartModal.module.scss";

interface Props {
  onInitialize: (data: DFWorldJson | null, size?: number) => void;
}

export const StartModal = ({ onInitialize }: Props) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsedData = WorldGenToUniversalJson.parse(text);

    onInitialize(parsedData, parsedData.dimensions?.width || 129);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1 className={styles.glitchTitle}>
          <span className={styles.qualitySymbol}>≡</span>☼ ARMOK'S BLUEPRINT ☼
          <span className={styles.qualitySymbol}>≡</span>
        </h1>
        <p className={styles.projectDescription}>
          Strike the silicon and carve the digital strata! This is the{" "}
          <strong>Great Anvil</strong> where world-seeds are forged. Shape the
          height of the peaks, the depth of the delvings, and the savagery of
          the wilds before the first dwarf even draws a breath. Prepare your{" "}
          <code>world_gen.txt</code> for a journey into the mountain’s heart —
          may your beards grow ever longer!
        </p>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>FORGE NEW WORLD</h3>
            <p>Initialize a blank slate with custom dimensions.</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => onInitialize(null, 129)}>
                Medium (129x129)
              </button>
              <button onClick={() => onInitialize(null, 257)}>
                Large (257x257)
              </button>
            </div>
          </div>

          <div
            className={`${styles.card} ${dragActive ? styles.active : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
            }}
          >
            <h3>RECLAIM ARCHIVE</h3>
            <p>Upload a world_gen.txt to resume your design.</p>
            <label className={styles.fileLabel}>
              BROWSE FILE
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                hidden
              />
            </label>
          </div>
        </div>
        <footer className={styles.modalFooter}>
          <span className={styles.version}>v0.0.1</span>
          <span className={styles.separator}> | </span>
          <span className={styles.qualityText}>"It is terrifying."</span>
          <span className={styles.separator}> — </span>
          <span className={styles.artifactDesc}>
            All craftsdwarfship is of the{" "}
            <span className={styles.legendary}>highest quality</span>.
          </span>
        </footer>
      </div>
    </div>
  );
};
