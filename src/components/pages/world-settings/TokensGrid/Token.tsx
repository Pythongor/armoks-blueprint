import styles from "./TokensGrid.module.scss";
import { updateActiveSetting } from "@store/worldSlice";
import { useDispatch } from "react-redux";

export type TokenProps = {
  token: string;
  occurrences: string[][];
};

export function Token({ token, occurrences }: TokenProps) {
  const dispatch = useDispatch();

  return (
    <div className={styles.tokenCard}>
      <div className={styles.tokenLabel}>{token}</div>
      <div className={styles.occurrenceList}>
        {occurrences.map((params, idx) => (
          <div key={idx} className={styles.parameterRow}>
            {params.map((param, pIdx) => (
              <input
                key={pIdx}
                className={styles.paramInput}
                value={param}
                onChange={(e) => {
                  const newParams = [...params];
                  newParams[pIdx] = e.target.value;
                  dispatch(
                    updateActiveSetting({
                      key: token,
                      index: idx,
                      params: newParams,
                    }),
                  );
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
