import { useDispatch, useSelector } from "react-redux";
import cn from "classnames";
import { type RootState } from "@store/index";
import { setActiveLayer, LayerType } from "@store/brushSlice";
import styles from "./LayersRadioGroup.module.scss";

const layers: Array<{ id: LayerType; label: string }> = [
  { id: LayerType.Elevation, label: "Elevation" },
  { id: LayerType.Rainfall, label: "Rainfall" },
  { id: LayerType.Drainage, label: "Drainage" },
  { id: LayerType.Temperature, label: "Temperature" },
  { id: LayerType.Volcanism, label: "Volcanism" },
];

export function LayersRadioGroup() {
  const dispatch = useDispatch();
  const { activeLayer } = useSelector((state: RootState) => state.brush);

  return (
    <div className={styles.base}>
      <label className={styles.label}>Layers</label>
      <div className={styles.radioGroup}>
        {layers.map((layer) => (
          <label key={layer.id} className={styles.radioLabel}>
            <input
              type="radio"
              name="activeLayer"
              value={layer.id}
              checked={activeLayer === layer.id}
              onChange={() => dispatch(setActiveLayer(layer.id))}
              className={styles.radioInput}
            />
            <div className={styles.radioContent}>
              <span className={cn(styles.indicator, styles[layer.id])} />
              {layer.label}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
