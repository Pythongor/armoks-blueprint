import { TokenOccurence } from "./TokenOccurence";
import styles from "./Token.module.scss";

export type TokenProps = {
  token: string;
  occurrences: string[][];
};

export function Token({ token, occurrences }: TokenProps) {
  return (
    <div className={styles.tokenCard}>
      <div className={styles.tokenLabel}>{token.replace(/_+/g, " ")}</div>
      <div className={styles.occurrenceList}>
        {occurrences.map((params, index) => (
          <div key={index} className={styles.parameterRow}>
            <TokenOccurence token={token} params={params} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
