import styles from "./Cards.module.scss";
import { useWorldInitializer } from "./hooks";

const sizes = [
  { name: "POCKET", dim: 17 },
  { name: "SMALLER", dim: 33 },
  { name: "SMALL", dim: 65 },
  { name: "MEDIUM", dim: 129 },
  { name: "LARGE", dim: 257 },
];

export function ForgeNewWorldCard() {
  const handleStart = useWorldInitializer();

  const createStandardTemplates = () => {
    const templates = [];

    for (const s of sizes) {
      templates.push({
        title: `${s.name} ISLAND`,
        size: s.dim,
        settings: { COMPLETE_OCEAN_EDGE_MIN: [["4"]] },
      });

      templates.push({
        title: `${s.name} REGION`,
        size: s.dim,
        settings: { COMPLETE_OCEAN_EDGE_MIN: [["0"]] },
      });
    }

    return templates;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>STRIKE THE EARTH</h3>
      </div>
      <p>
        Initialize the <strong>Ten Great Templates</strong>. Forge your world
        across every scale, from Pocket Outposts to Mighty Mountain-Homes.
      </p>

      <div className={styles.buttonGroup}>
        <button
          className={styles.forgeButton}
          onClick={() => handleStart(createStandardTemplates())}
        >
          PREPARE THE BLUEPRINTS
        </button>
      </div>
    </div>
  );
}
