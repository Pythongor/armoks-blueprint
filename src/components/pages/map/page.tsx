import { LeftSidebar } from "./LeftSidebar/LeftSidebar";
import { RightSidebar } from "./RightSidebar/RightSidebar";
import { StatusBar } from "./StatusBar/StatusBar";
import { TileMap } from "./TileMap/TileMap";
import styles from "./page.module.scss";
import { useMapHistory } from "@hooks/useMapHistory";

export function MapPage() {
  useMapHistory();

  return (
    <div className={styles.base}>
      <LeftSidebar />
      <TileMap />
      <RightSidebar />
      <StatusBar />
    </div>
  );
}
