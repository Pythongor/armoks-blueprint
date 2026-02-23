import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import styles from "./Header.module.scss";

export type HeaderProps = {
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
};

export function Header({ searchTerm, setSearchTerm }: HeaderProps) {
  const { presets, activePresetTitle } = useSelector(
    (state: RootState) => state.world,
  );

  const activePreset = activePresetTitle ? presets[activePresetTitle] : null;

  if (!activePreset) {
    return null;
  }

  return (
    <header className={styles.base}>
      <section className={styles.row}>
        <div className={styles.titleGroup}>
          <span className={styles.qualitySymbol}>≡</span>
          <h2 className={styles.title}>WORLD SETTINGS</h2>
          <span className={styles.qualitySymbol}>≡</span>
        </div>
      </section>
      <section className={styles.row}>
        <div>
          <h2 className={styles.presetTitle}>{activePreset.title}</h2>
          <p>Adjusting regional parameters for the active blueprint.</p>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Filter Tokens (e.g. EMBARK_POINTS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>
    </header>
  );
}
