import { updateActiveSetting } from "@store/worldSlice";
import { type RootState } from "@store/index";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Token.module.scss";

export type DimensionSelectorProps = {
  params: string[];
  index: number;
};

const WORLD_SIZES = [
  { label: "Pocket (17×17)", value: "17" },
  { label: "Smaller (33×33)", value: "33" },
  { label: "Small (65×65)", value: "65" },
  { label: "Medium (129×129)", value: "129" },
  { label: "Large (257×257)", value: "257" },
];

export function DimensionSelector({ params, index }: DimensionSelectorProps) {
  const dispatch = useDispatch();
  const activePresetTitle = useSelector(
    (state: RootState) => state.world.activePresetTitle,
  );

  const handleDimChange = (newSize: string, occurrenceIndex: number) => {
    if (!activePresetTitle) return;

    const confirmChange = window.confirm(
      "Changing dimensions will clear all current drawings on this blueprint. Proceed?",
    );
    if (!confirmChange) return;

    const newParams = [newSize, newSize];

    dispatch(
      updateActiveSetting({
        key: "DIM",
        index: occurrenceIndex,
        params: newParams,
      }),
    );
  };

  return (
    <select
      className={styles.paramSelect}
      value={params[0]}
      onChange={(e) => handleDimChange(e.target.value, index)}
    >
      {WORLD_SIZES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
