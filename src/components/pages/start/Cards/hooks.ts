import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { worldManager } from "@tile-map/WorldManager";
import { initializeWorld, type WorldPreset } from "@store/worldSlice";

export const useWorldInitializer = () => {
  const dispatch = useDispatch();

  return useCallback(
    (presets: WorldPreset[]) => {
      worldManager.reset();

      console.log(presets);

      presets.forEach((p) => {
        worldManager.createPreset(p.title, p.size);
      });

      if (presets.length > 0) {
        worldManager.switchToPreset(presets[0].title);
      }

      dispatch(initializeWorld(presets));
    },
    [dispatch],
  );
};
