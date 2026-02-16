import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import {
  setActiveLayer,
  setLockedToBiomes,
  setBrushValue,
  LayerType,
} from "@store/brushSlice";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
  const dispatch = useDispatch();
  const { activeLayer, isLockedToBiomes, layerValues } = useSelector(
    (state: RootState) => state.brush,
  );
  const { x, y } = useSelector((state: RootState) => state.coords);

  const layers: Array<{ id: LayerType; label: string }> = [
    { id: LayerType.Elevation, label: "Elevation" },
    { id: LayerType.Rainfall, label: "Rainfall" },
    { id: LayerType.Drainage, label: "Drainage" },
    { id: LayerType.Temperature, label: "Temperature" },
    { id: LayerType.Volcanism, label: "Volcanism" },
  ];

  const maxRange = activeLayer === LayerType.Elevation ? 400 : 100;
  const currentValue = layerValues[activeLayer];

  return (
    <div className={styles.base}>
      <h1 className={styles.title}>Armok's Blueprint</h1>

      <section className={styles.section}>
        <label className={styles.toggleRow}>
          <div className={styles.labelText}>Composite View</div>
          <input
            type="checkbox"
            checked={isLockedToBiomes}
            onChange={(e) => dispatch(setLockedToBiomes(e.target.checked))}
            className={styles.toggleInput}
          />
        </label>
      </section>

      <section className={styles.section}>
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
                <span className={`${styles.indicator} ${styles[layer.id]}`} />
                {layer.label}
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
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
      </section>

      <div className={styles.divider} />
      <button className={styles.exportBtn}>Export world_gen.txt</button>

      <div className={styles.divider} />
      <div className={styles.statusBar}>
        <span>
          Tile: [{x}:{y}]
        </span>
      </div>
    </div>
  );
}
