import { LayersRadioGroup } from "./LayersRadioGroup/LayersRadioGroup";
import { BrushSlider } from "./BrushSlider/BrushSlider";
import styles from "./LeftSidebar.module.scss";

export function LeftSidebar() {
  return (
    <div className={styles.base}>
      <h1 className={styles.title}>Armok's Blueprint</h1>

      <section className={styles.section}>
        <LayersRadioGroup />
      </section>

      <section className={styles.section}>
        <BrushSlider />
      </section>
    </div>
  );
}
