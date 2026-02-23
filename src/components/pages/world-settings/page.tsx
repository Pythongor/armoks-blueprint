import { useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { PresetsSidebar } from "./PresetsSidebar/PresetsSidebar";
import { Header } from "./Header/Header";
import { TokensGrid } from "./TokensGrid/TokensGrid";
import styles from "./page.module.scss";

export const WorldSettingsPage = () => {
  const { presets, activePresetTitle } = useSelector(
    (state: RootState) => state.world,
  );
  const [searchTerm, setSearchTerm] = useState("");

  const activePreset = activePresetTitle ? presets[activePresetTitle] : null;

  if (!activePreset)
    return (
      <div className={styles.empty}>No blueprints found in the archive.</div>
    );

  return (
    <div className={styles.base}>
      <PresetsSidebar />
      <main className={styles.editor}>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <TokensGrid searchTerm={searchTerm} />
      </main>
    </div>
  );
};
