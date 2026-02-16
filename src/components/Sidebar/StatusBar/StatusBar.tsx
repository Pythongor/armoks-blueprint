import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import styles from "./StatusBar.module.scss";

export function StatusBar() {
  const { x, y } = useSelector((state: RootState) => state.coords);

  return (
    <div className={styles.base}>
      <span>
        Tile: [{x}:{y}]
      </span>
    </div>
  );
}
