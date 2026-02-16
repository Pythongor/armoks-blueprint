import { CompositeToggle } from "./CompositeToggle/CompositeToggle";
import { LayersRadioGroup } from "./LayersRadioGroup/LayersRadioGroup";
import { BrushSlider } from "./BrushSlider/BrushSlider";
import { StatusBar } from "./StatusBar/StatusBar";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
  return (
    <div className={styles.base}>
      <h1 className={styles.title}>Armok's Blueprint</h1>

      <section className={styles.section}>
        <CompositeToggle />
      </section>

      <section className={styles.section}>
        <LayersRadioGroup />
      </section>

      <section className={styles.section}>
        <BrushSlider />
      </section>

      <div className={styles.divider} />
      <button className={styles.exportBtn}>Export world_gen.txt</button>

      <div className={styles.divider} />
      <StatusBar />
    </div>
  );
}
