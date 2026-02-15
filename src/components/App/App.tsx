import { TileMap } from "@components/TileMap/TileMap";
import { Sidebar } from "@components/Sidebar/Sidebar";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <TileMap />
    </div>
  );
}

export default App;
