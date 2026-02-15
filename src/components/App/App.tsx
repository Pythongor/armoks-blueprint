import { TileMap } from "@components/TileMap/TileMap";
import { Sidebar } from "@components/Sidebar/Sidebar";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.base}>
      <Sidebar />
      <TileMap />
    </div>
  );
}

export default App;
