import { useSelector } from "react-redux";
import { type RootState } from "@store/index";
import { Token } from "./Token";
import styles from "./TokensGrid.module.scss";

export type TokensGridProps = {
  searchTerm: string;
};

export function TokensGrid({ searchTerm }: TokensGridProps) {
  const { presets, activePresetTitle } = useSelector(
    (state: RootState) => state.world,
  );

  const activePreset = activePresetTitle ? presets[activePresetTitle] : null;

  if (!activePreset)
    return (
      <div className={styles.empty}>No blueprints found in the archive.</div>
    );

  const filteredTokens = Object.entries(activePreset.settings).filter(([key]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.base}>
      {filteredTokens.map(([token, occurrences]) => (
        <Token key={token} token={token} occurrences={occurrences} />
      ))}
    </div>
  );
}
