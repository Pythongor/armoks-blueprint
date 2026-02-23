import styles from "./Cards.module.scss";

export function WorldGenCard() {
  return (
    <section className={`${styles.exportCard} ${styles.disabled}`}>
      <div className={styles.cardInfo}>
        <h3>World Gen Parameters</h3>
        <p>Export your tokens and logic settings into a world_gen.txt file.</p>
      </div>
      <button disabled>LOCKED IN ARCHIVE</button>
    </section>
  );
}
