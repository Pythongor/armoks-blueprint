import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setBrushValue, LayerType } from "@store/brushSlice";
import styles from "./BrushSlider.module.scss";

export function BrushSlider() {
  const dispatch = useDispatch();
  const { activeLayer, layerValues } = useSelector(
    (state: RootState) => state.brush,
  );

  const maxRange = activeLayer === LayerType.Elevation ? 400 : 100;
  const currentValue = layerValues[activeLayer];

  return (
    <div>
      <div className={styles.labelRow}>
        <label className={styles.label}>Brush Value</label>
        <span className={styles.valueDisplay}>{currentValue}</span>
      </div>
      <input
        type="range"
        min="0"
        max={maxRange}
        value={currentValue}
        onChange={(e) =>
          dispatch(
            setBrushValue({
              layer: activeLayer,
              value: Number(e.target.value),
            }),
          )
        }
        className={styles.slider}
      />
    </div>
  );
}
