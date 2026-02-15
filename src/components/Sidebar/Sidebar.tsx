import { EventBus } from "@tile-map/EventBus";

export function Sidebar() {
  const setBrush = (id: number) => {
    EventBus.emit("change-brush", id);
  };

  return (
    <div
      style={{
        width: "200px",
        padding: "20px",
        background: "#222",
        color: "white",
      }}
    >
      <h2>Armok's Blueprint</h2>
      <button onClick={() => setBrush(1)}>Grass Brush</button>
      <button onClick={() => setBrush(0)}>Water Brush</button>
      <hr />
      <button onClick={() => console.log("Exporting logic goes here...")}>
        Export world_gen.txt
      </button>
    </div>
  );
}
