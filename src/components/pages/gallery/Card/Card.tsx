import type { MapData } from "@/types";
import type { RootState } from "@store/index";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import cn from "classnames";
import styles from "./Card.module.scss";
import { useSelector } from "react-redux";

export type CardProps = {
  title: string;
  size: number;
  onClick: () => void;
  mapData: MapData;
};

export function Card({ title, size, onClick, mapData }: CardProps) {
  const { selectedTitles } = useSelector((state: RootState) => state.gallery);

  return (
    <div
      key={title}
      className={cn(
        styles.base,
        selectedTitles.includes(title) && styles.base__active,
      )}
      onClick={onClick}
    >
      <Thumbnail data={mapData} size={size} />
      <h4 className={styles.title}>{title}</h4>
      <span className={styles.size}>
        {size} x {size}
      </span>
    </div>
  );
}
