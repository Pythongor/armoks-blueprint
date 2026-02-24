import { Token } from "../Token/Token";
import styles from "./Category.module.scss";

export type CategoryProps = {
  category: string;
  tokens: [string, string[][]][];
};

export function Category({ category, tokens }: CategoryProps) {
  if (tokens.length === 0) return null;

  return (
    <div key={category} className={styles.base}>
      <h3 className={styles.categoryHeader}>{category.replace(/_+/g, " ")}</h3>
      <div className={styles.categoryContent}>
        {tokens.map(([token, occurrences]) => (
          <Token key={token} token={token} occurrences={occurrences} />
        ))}
      </div>
    </div>
  );
}
