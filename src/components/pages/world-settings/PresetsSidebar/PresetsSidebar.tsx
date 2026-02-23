import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "@store/index";
import { setActivePreset } from "@store/worldSlice";
import { EventBus } from "@tile-map/EventBus";
import cn from "classnames";
import styles from "./PresetsSidebar.module.scss";

export function PresetsSidebar() {
  const dispatch = useDispatch();

  const { presets, activePresetTitle } = useSelector(
    (state: RootState) => state.world,
  );

  const presetNames = Object.keys(presets);

  const handleSwitchPreset = (title: string) => {
    dispatch(setActivePreset(title));
    EventBus.emit("preset-switched", title);
  };

  return (
    <aside className={styles.base}>
      <header className={styles.sidebarHeader}>PRESETS</header>
      <div className={styles.container}>
        {presetNames.map((name) => (
          <button
            key={name}
            className={cn(
              styles.tab,
              activePresetTitle === name && styles.active,
            )}
            onClick={() => handleSwitchPreset(name)}
          >
            <div className={styles.tabInfo}>
              <span className={styles.tabTitle}>{name}</span>
              <span className={styles.tabSubtitle}>
                {presets[name].size}×{presets[name].size}
              </span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
