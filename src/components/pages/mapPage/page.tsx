import { LeftSidebar } from "./LeftSidebar/LeftSidebar";
import { RightSidebar } from "./RightSidebar/RightSidebar";
import { TileMap } from "./TileMap/TileMap";
import styles from "./page.module.scss";

export function MapPage() {
  return (
    <div className={styles.base}>
      <LeftSidebar />
      <TileMap />
      <RightSidebar />
    </div>
  );
}
