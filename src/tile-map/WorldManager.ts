import { getMoralDescriptor, identifyBiome } from "@/helpers/biomeResolver";

import { LayerType } from "@store/brushSlice";

export type WorldDataLayers = Record<LayerType, Uint16Array>;

export class WorldManager {
  public gridSize: number = 129;
  private presets: Map<string, WorldDataLayers> = new Map();
  private activePresetTitle: string = "DEFAULT";

  constructor() {
    this.createPreset("DEFAULT", 129);
  }

  public createPreset(title: string, size: number) {
    const data: WorldDataLayers = {
      elevation: new Uint16Array(size * size).fill(100),
      rainfall: new Uint16Array(size * size).fill(50),
      drainage: new Uint16Array(size * size).fill(50),
      temperature: new Uint16Array(size * size).fill(50),
      volcanism: new Uint16Array(size * size).fill(0),
      savagery: new Uint16Array(size * size).fill(0),
      alignment: new Uint16Array(size * size).fill(50),
    };

    this.presets.set(title, data);
    this.activePresetTitle = title;
    this.gridSize = size;
    return data;
  }

  public switchToPreset(title: string) {
    if (this.presets.has(title)) {
      this.activePresetTitle = title;
      const data = this.presets.get(title)!;
      this.gridSize = Math.sqrt(data.elevation.length);
    }
  }

  get worldData(): WorldDataLayers {
    return this.presets.get(this.activePresetTitle)!;
  }

  getPointData(index: number) {
    const data = this.worldData;
    return {
      elevation: data.elevation[index],
      rainfall: data.rainfall[index],
      drainage: data.drainage[index],
      temperature: data.temperature[index],
      volcanism: data.volcanism[index],
      savagery: data.savagery[index],
      alignment: data.alignment[index],
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

  public getAllPresetTitles(): string[] {
    return Array.from(this.presets.keys());
  }

  public getPresetData(title: string): WorldDataLayers {
    return this.presets.get(title)!;
  }

  public reset() {
    this.presets.clear();
    this.createPreset("DEFAULT", 129);
  }
}

export const worldManager = new WorldManager();
