import { LayerType } from "@store/brushSlice";
import { identifyBiome, getMoralDescriptor } from "@/helpers/biomeResolver";

export class WorldManager {
  public gridSize: number = 129;
  public worldData: Record<LayerType, Uint16Array>;

  constructor() {
    this.worldData = {
      elevation: new Uint16Array(this.gridSize * this.gridSize).fill(100),
      rainfall: new Uint16Array(this.gridSize * this.gridSize).fill(50),
      drainage: new Uint16Array(this.gridSize * this.gridSize).fill(50),
      temperature: new Uint16Array(this.gridSize * this.gridSize).fill(50),
      volcanism: new Uint16Array(this.gridSize * this.gridSize).fill(0),
      savagery: new Uint16Array(this.gridSize * this.gridSize).fill(0),
      alignment: new Uint16Array(this.gridSize * this.gridSize).fill(50),
    };
  }

  getPointData(index: number) {
    return {
      elevation: this.worldData.elevation[index],
      rainfall: this.worldData.rainfall[index],
      drainage: this.worldData.drainage[index],
      temperature: this.worldData.temperature[index],
      volcanism: this.worldData.volcanism[index],
      savagery: this.worldData.savagery[index],
      alignment: this.worldData.alignment[index],
    };
  }

  updateTile(index: number, layer: LayerType, value: number) {
    this.worldData[layer][index] = value;
  }

  getBiome(index: number) {
    return identifyBiome(this.getPointData(index));
  }

  getBiomeDescriptor(index: number) {
    const data = this.getPointData(index);
    return getMoralDescriptor(data.savagery, data.alignment);
  }
}

export const worldManager = new WorldManager();
