import { useMemo } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "@store/store";
import { Category } from "../Category/Category";
import { HIDDEN_TOKENS, TOKEN_CATEGORIES } from "../constants";
import styles from "./TokensGrid.module.scss";

export type TokensGridProps = {
  searchTerm: string;
};

export function TokensGrid({ searchTerm }: TokensGridProps) {
  const { presets, activePresetTitle } = useSelector(
    (state: RootState) => state.world,
  );

  const activePreset = activePresetTitle ? presets[activePresetTitle] : null;
  const groupedTokens = useMemo(() => {
    const groups: Record<string, [string, string[][]][]> = {
      GEOGRAPHY: [],
      RANGES: [],
      HISTORY: [],
      MYTH_AND_MAGIC: [],
      RESOURCES: [],
      HORRORS: [],
      CAVERNS: [],
      MISC: [],
    };

    if (!activePreset) return groups;

    Object.entries(activePreset.settings).forEach(([token, occurrences]) => {
      if (HIDDEN_TOKENS.includes(token)) return;

      if (!token.toLowerCase().includes(searchTerm.toLowerCase())) return;

      let found = false;
      for (const [category, tokenList] of Object.entries(TOKEN_CATEGORIES)) {
        if (tokenList.includes(token)) {
          groups[category].push([token, occurrences]);
          found = true;
          break;
        }
      }

      if (!found) groups.MISC.push([token, occurrences]);
    });

    return groups;
  }, [activePreset, searchTerm]);

  if (!activePreset) {
    return (
      <div className={styles.empty}>No blueprints found in the archive.</div>
    );
  }

  return (
    <div className={styles.base}>
      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <Category key={category} category={category} tokens={tokens} />
      ))}
    </div>
  );
}
