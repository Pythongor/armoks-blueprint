import { CompositeToggle } from "../CompositeToggle/CompositeToggle";
import { PresetSelector } from "../PresetSelector/PresetSelector";
import { StatusBar } from "../StatusBar/StatusBar";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <CompositeToggle />
      </section>

      <div className={styles.divider}></div>
      <section className={styles.section}>
        <PresetSelector />
      </section>

      <div className={styles.divider}></div>
      <StatusBar />
    </div>
  );
}
