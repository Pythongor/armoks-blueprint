import styles from "./Slider.module.scss";

export type SliderProps = {
  min?: number;
  max?: number;
  step?: number;
  currentValue: number;
  onChange: (value: number) => void;
  label: string;
};

export function Slider({
  min,
  max,
  step,
  currentValue,
  onChange,
  label,
}: SliderProps) {
  return (
    <div>
      <div className={styles.labelRow}>
        <label className={styles.label}>{label}</label>
        <span className={styles.valueDisplay}>{currentValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(e) => onChange(+e.target.value)}
        className={styles.slider}
      />
    </div>
  );
}
