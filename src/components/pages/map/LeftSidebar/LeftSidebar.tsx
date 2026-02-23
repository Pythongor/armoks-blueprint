import { BrushSlider } from "../BrushSlider/BrushSlider";
import { LayersRadioGroup } from "../LayersRadioGroup/LayersRadioGroup";
import styles from "./LeftSidebar.module.scss";

export function LeftSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <LayersRadioGroup />
      </section>

      <section className={styles.section}>
        <BrushSlider />
      </section>
    </div>
  );
}
