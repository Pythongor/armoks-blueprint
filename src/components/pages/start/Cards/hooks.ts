import { Modal, setModal } from "@store/uiSlice";

import { SuffixToLayer } from "@utils/JsonToWorldGen";
import type { WorldPreset } from "@/types";
import { initializeWorld } from "@store/worldSlice";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { worldManager } from "@tile-map/WorldManager";

export const useWorldInitializer = (withModal = false) => {
  const dispatch = useDispatch();

  return useCallback(
    (presets: WorldPreset[]) => {
      worldManager.reset();

      presets.forEach((p) => {
        worldManager.createPreset(p.title, p.size);

        if (p.mapData) {
          Object.entries(p.mapData).forEach(([suffixLayer, points]) => {
            points.forEach((point) => {
              const index = point.y * p.size + point.x;

              if (index < p.size * p.size) {
                const layer = SuffixToLayer[suffixLayer.toUpperCase()];
                worldManager.updateTile(index, layer, point.v);
              }
            });
          });
        }
      });

      if (presets.length > 0) {
        worldManager.switchToPreset(presets[0].title);
      }

      const modal = withModal ? Modal.ResetDestructiveOptions : Modal.None;
      dispatch(initializeWorld(presets));
      dispatch(setModal(modal));
    },
    [dispatch, withModal],
  );
};
