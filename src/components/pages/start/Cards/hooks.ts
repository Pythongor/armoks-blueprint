import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { type DFWorldJson } from "@utils/WorldGenParser";
import { worldManager } from "@tile-map/WorldManager";
import type { LayerType } from "@store/brushSlice";
import { initializeWorld } from "@store/worldSlice";

export const useWorldInitializer = () => {
  const dispatch = useDispatch();

  return useCallback(
    (parsedJson: DFWorldJson | null, size: number = 129) => {
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
    },
    [dispatch],
  );
};
