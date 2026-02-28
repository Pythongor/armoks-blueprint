import { BrushShapeSelector } from "../BrushShapeSelector/BrushShapeSelector";
import { BrushSizeSlider } from "../Sliders/BrushSizeSlider";
import { BrushValueSlider } from "../Sliders/BrushValueSlider";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <BrushValueSlider />
        <BrushSizeSlider />
        <BrushShapeSelector />
      </section>
    </div>
  );
}
