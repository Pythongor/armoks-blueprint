import { useDispatch, useSelector } from "react-redux";

import { Card } from "../Card/Card";
import type { RootState } from "@store/index";
import styles from "./CardsGrid.module.scss";
import { toggleSelection } from "@store/gallerySlice";

export function CardsGrid() {
  const { availableBlueprints } = useSelector(
    (state: RootState) => state.gallery,
  );
  const dispatch = useDispatch();

  return (
    <div className={styles.base}>
      <div className={styles.container}>
        {availableBlueprints.map(({ title, size, mapData }) => (
          <Card
            key={title}
            title={title}
            size={size}
            mapData={mapData}
            onClick={() => dispatch(toggleSelection(title))}
          />
        ))}
      </div>
    </div>
  );
}
