import styles from "../Cards.module.scss";
import { useWorldInitializer } from "../hooks";

export function ForgeNewWorldCard() {
  const handleStart = useWorldInitializer();

  return (
    <div className={styles.card}>
      <h3>FORGE NEW WORLD</h3>
      <p>Initialize a blank slate with custom dimensions.</p>
      <div className={styles.buttonGroup}>
        <button onClick={() => handleStart(null, 129)}>Medium (129x129)</button>
        <button onClick={() => handleStart(null, 257)}>Large (257x257)</button>
      </div>
    </div>
  );
}
