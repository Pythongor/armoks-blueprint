import { setPaintMode, PaintMode } from "@store/slices/paintSlice";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { InlineSelector } from "@components/widgets/InlineSelector/InlineSelector";
import styles from "./Selectors.module.scss";

export function PaintModeSelector() {
  const dispatch = useDispatch();

  const currentMode = useSelector((state: RootState) => state.paint.paintMode);

  const handleModeChange = (mode: string) => {
    dispatch(setPaintMode(mode as PaintMode));
  };

  return (
    <div className={styles.modeSelector}>
      <InlineSelector
        label="Paint Mode"
        options={[
          { value: PaintMode.Brush, label: "BRUSH" },
          { value: PaintMode.Line, label: "LINE" },
        ]}
        currentMode={currentMode}
        handleChange={handleModeChange}
      />
    </div>
  );
}
