import { BrushShape, setBrushShape } from "@store/brushSlice";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@store/index";
import cn from "classnames";
import styles from "./BrushShapeSelector.module.scss";

export function BrushShapeSelector() {
  const dispatch = useDispatch();
  const { brushShape } = useSelector((state: RootState) => state.brush);

  return (
    <div className={styles.base}>
      <label className={styles.label}>Shape</label>
      <div className={styles.buttonGroup}>
        <button
          className={cn(
            styles.button,
            brushShape === BrushShape.Square && styles.button__active,
          )}
          onClick={() => dispatch(setBrushShape(BrushShape.Square))}
        >
          SQUARE
        </button>
        <button
          className={cn(
            styles.button,
            brushShape === BrushShape.Circle && styles.button__active,
          )}
          onClick={() => dispatch(setBrushShape(BrushShape.Circle))}
        >
          CIRCLE
        </button>
      </div>
    </div>
  );
}
