import { ForgeNewWorldCard } from "./components/ForgeNewWorldCard";
import { ReclaimArchiveCard } from "./components/ReclaimArchiveCard";
import styles from "./Cards.module.scss";

export function Cards() {
  return (
    <div className={styles.base}>
      <ForgeNewWorldCard />
      <ReclaimArchiveCard />
    </div>
  );
}
