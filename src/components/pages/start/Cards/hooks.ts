import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { worldManager } from "@tile-map/WorldManager";
import { setModal, Modal } from "@store/uiSlice";
import { initializeWorld, type WorldPreset } from "@store/worldSlice";

export const useWorldInitializer = (withModal = false) => {
  const dispatch = useDispatch();

  return useCallback(
    (presets: WorldPreset[]) => {
      worldManager.reset();

      presets.forEach((p) => {
        worldManager.createPreset(p.title, p.size);
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
