import styles from "./Cards.module.scss";
import { useWorldInitializer } from "./hooks";

const WORLD_SIZES = [
  { label: "Pocket", size: 17 },
  { label: "Smaller", size: 33 },
  { label: "Small", size: 65 },
  { label: "Medium", size: 129 },
  { label: "Large", size: 257 },
];

export function ForgeNewWorldCard() {
  const handleStart = useWorldInitializer();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>STRIKE THE EARTH</h3>
      </div>
      <p>Forge a new realm from the primordial void.</p>

      <div className={styles.sizeGrid}>
        {WORLD_SIZES.map(({ label, size }) => (
          <button
            key={label}
            className={styles.sizeButton}
            onClick={() => handleStart(null, size)}
          >
            <span className={styles.btnLabel}>{label}</span>
            <span className={styles.btnValue}>
              {size}×{size}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
