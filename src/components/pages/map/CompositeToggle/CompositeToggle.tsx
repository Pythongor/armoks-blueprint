import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { setLockedToBiomes } from "@/store/paintSlice";
import styles from "./CompositeToggle.module.scss";

export function CompositeToggle() {
  const dispatch = useDispatch();
  const { isLockedToBiomes } = useSelector((state: RootState) => state.paint);

  return (
    <label className={styles.base}>
      <span className={styles.text}>Composite View</span>
      <input
        type="checkbox"
        checked={isLockedToBiomes}
        onChange={(e) => dispatch(setLockedToBiomes(e.target.checked))}
        className={styles.input}
      />
    </label>
  );
}
