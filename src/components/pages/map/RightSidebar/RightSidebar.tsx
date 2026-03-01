import { BrushOpacitySlider } from "../Sliders/BrushOpacitySlider";
import { BrushShapeSelector } from "../Selectors/BrushShapeSelector";
import { BrushSizeSlider } from "../Sliders/BrushSizeSlider";
import { BrushValueSlider } from "../Sliders/BrushValueSlider";
import { PaintModeSelector } from "../Selectors/PaintModeSelector";
import styles from "./RightSidebar.module.scss";

export function RightSidebar() {
  return (
    <div className={styles.base}>
      <section className={styles.section}>
        <PaintModeSelector />
        <BrushValueSlider />
        <BrushSizeSlider />
        <BrushOpacitySlider />
        <BrushShapeSelector />
      </section>
    </div>
  );
}
