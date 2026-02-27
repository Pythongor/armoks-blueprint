import { BrushSlider } from "../BrushSlider/BrushSlider";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <BrushSlider />
      </section>
    </div>
  );
}
