import { EventBus } from "@tile-map/EventBus";
import styles from "./Sidebar.module.scss";

export function Sidebar() {
  const setBrush = (id: number) => {
    EventBus.emit("change-brush", id);
  };

  return (
    <div className={styles.base}>
      <h1 className={styles.title}>Armok's Blueprint</h1>
      <button onClick={() => setBrush(1)}>Grass Brush</button>
      <button onClick={() => setBrush(0)}>Water Brush</button>
      <hr className={styles.divider} />
      <button onClick={() => console.log("Exporting logic goes here...")}>
        Export world_gen.txt
      </button>
    </div>
  );
}
