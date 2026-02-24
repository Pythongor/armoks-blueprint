import { DimensionSelector } from "./DimensionSelector";
import { MultipleNumberInput } from "./MultipleNumberInput";
import styles from "./Token.module.scss";

export type TokenProps = {
  token: string;
  occurrences: string[][];
};

export function Token({ token, occurrences }: TokenProps) {
  return (
    <div className={styles.tokenCard}>
      <div className={styles.tokenLabel}>{token}</div>
      <div className={styles.occurrenceList}>
        {occurrences.map((params, index) => (
          <div key={index} className={styles.parameterRow}>
            {token === "DIM" ? (
              <DimensionSelector params={params} index={index} />
            ) : (
              <MultipleNumberInput
                params={params}
                token={token}
                index={index}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
