import { TileMap } from "@components/TileMap/TileMap";
import { LeftSidebar } from "@components/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@components/RightSidebar/RightSidebar";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.base}>
      <LeftSidebar />
      <TileMap />
      <RightSidebar />
    </div>
  );
}

export default App;
