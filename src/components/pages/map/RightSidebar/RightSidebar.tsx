import { CompositeToggle } from "../CompositeToggle/CompositeToggle";
import { StatusBar } from "../StatusBar/StatusBar";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <CompositeToggle />
      </section>

      <div className={styles.divider} />
      <StatusBar />
    </div>
  );
}
