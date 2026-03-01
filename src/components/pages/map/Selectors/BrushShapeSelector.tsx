import { BrushShape, PaintMode, setBrushShape } from "@/store/paintSlice";
import { useDispatch, useSelector } from "react-redux";

import { InlineSelector } from "@components/widgets/InlineSelector/InlineSelector";
import type { RootState } from "@store/index";
import styles from "./Selectors.module.scss";

export function BrushShapeSelector() {
  const dispatch = useDispatch();
  const { brushShape, paintMode } = useSelector(
    (state: RootState) => state.paint,
  );

  if (paintMode !== PaintMode.Brush) return null;

  return (
    <div className={styles.shapeSelector}>
      <InlineSelector
        label="Shape"
        options={[
          { value: BrushShape.Square, label: "SQUARE" },
          { value: BrushShape.Circle, label: "CIRCLE" },
        ]}
        currentMode={brushShape}
        handleChange={(value) => dispatch(setBrushShape(value as BrushShape))}
      />
    </div>
  );
}
