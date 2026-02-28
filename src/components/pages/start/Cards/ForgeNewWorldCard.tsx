import { DEFAULT_CONFIG } from "@store/configs";
import { isArrayOfArrays } from "@helpers/typeGuards";
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
      const settings: Record<string, string[][]> = {
        DIM: [[String(s.dim), String(s.dim)]],
      };

      Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => {
        if (isArrayOfArrays<string>(value)) {
          settings[key] = value;
        } else {
          settings[key] = [value];
        }
      });

      templates.push({
        title: `${s.name} REGION`,
        size: s.dim,
        settings,
      });
    }

    return templates;
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3>STRIKE THE EARTH</h3>
        <p>
          Initialize the <strong>Five Great Templates</strong>. Forge your world
          across every scale, from Pocket Outposts to Mighty Mountain-Homes.
        </p>
      </div>

      <div className={styles.buttonGroup}>
        <button
          className={styles.button}
          onClick={() => handleStart(createStandardTemplates())}
        >
          PREPARE THE BLUEPRINTS
        </button>
      </div>
    </div>
  );
}
