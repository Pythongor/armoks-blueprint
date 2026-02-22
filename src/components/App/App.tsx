import { StartModal } from "@components/StartModal/StartModal";
import { LeftSidebar } from "@components/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@components/RightSidebar/RightSidebar";
import { TileMap } from "@components/TileMap/TileMap";
import styles from "./App.module.scss";
import { worldManager } from "@tile-map/WorldManager";
import { type DFWorldJson } from "@utils/WorldGenParser";
import type { LayerType } from "@store/brushSlice";
import { initializeWorld } from "@store/worldSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";

function App() {
  const dispatch = useDispatch();
  const isInitialized = useSelector(
    (state: RootState) => state.world.isInitialized,
  );

  const handleStart = (parsedJson: DFWorldJson | null, size: number = 129) => {
    worldManager.setSize(size);

    if (parsedJson?.mapData) {
      Object.entries(parsedJson.mapData).forEach(([layerName, points]) => {
        const layer = layerName as LayerType;
        if (worldManager.worldData[layer]) {
          points.forEach((p) => {
            const index = p.y * size + p.x;
            if (index < worldManager.worldData[layer].length) {
              worldManager.updateTile(index, layer, p.v);
            }
          });
        }
      });
    }

    dispatch(
      initializeWorld({
        title: parsedJson?.title,
        size: size,
        settings: parsedJson?.settings,
      }),
    );
  };

  if (!isInitialized) {
    return <StartModal onInitialize={handleStart} />;
  }

  return (
    <div className={styles.base}>
      <LeftSidebar />
      <TileMap />
      <RightSidebar />
    </div>
  );
}

export default App;
