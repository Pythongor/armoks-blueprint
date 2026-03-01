import { getMoralDescriptor, identifyBiome } from "@helpers/biomeResolver";

import { LayerType } from "@store/paintSlice";

export type WorldDataLayers = Record<LayerType, Uint16Array>;

export class WorldManager {
  public gridSize: number = 129;
  private presets: Map<string, WorldDataLayers> = new Map();
  private activePresetTitle: string = "DEFAULT";

  private undoStack: WorldDataLayers[] = [];
  private redoStack: WorldDataLayers[] = [];
  private readonly MAX_HISTORY = 30;

  constructor() {
    this.createPreset("DEFAULT", 129);
  }

  public createPreset(title: string, size: number, isActive: boolean = true) {
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
    if (isActive) {
      this.activePresetTitle = title;
      this.gridSize = size;
    }
    return data;
  }

  public removePreset(title: string) {
    this.presets.delete(title);
  }

  public switchToPreset(title: string) {
    if (this.presets.has(title)) {
      this.activePresetTitle = title;
      const data = this.presets.get(title)!;
      this.gridSize = Math.sqrt(data.elevation.length);
      this.clearHistory();
    }
  }

  public saveSnapshot() {
    const current = this.worldData;
    const snapshot: WorldDataLayers = {} as WorldDataLayers;

    (Object.keys(current) as LayerType[]).forEach((layer) => {
      snapshot[layer] = new Uint16Array(current[layer]);
    });

    this.undoStack.push(snapshot);

    if (this.undoStack.length > this.MAX_HISTORY) {
      this.undoStack.shift();
    }

    this.redoStack = [];
  }

  public undo(): boolean {
    if (this.undoStack.length === 0) return false;

    this.redoStack.push(this.cloneCurrentData());
    const previousState = this.undoStack.pop()!;
    this.applyState(previousState);

    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;

    this.undoStack.push(this.cloneCurrentData());
    const nextState = this.redoStack.pop()!;
    this.applyState(nextState);

    return true;
  }

  private clearHistory() {
    this.undoStack = [];
    this.redoStack = [];
  }

  private cloneCurrentData(): WorldDataLayers {
    const current = this.worldData;
    const clone: WorldDataLayers = {} as WorldDataLayers;

    (Object.keys(current) as LayerType[]).forEach((layer) => {
      clone[layer] = new Uint16Array(current[layer]);
    });

    return clone;
  }

  private applyState(state: WorldDataLayers) {
    const current = this.worldData;

    (Object.keys(state) as LayerType[]).forEach((layer) => {
      current[layer].set(state[layer]);
    });
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

  public copyBufferData(sourceTitle: string, targetTitle: string) {
    const source = this.presets.get(sourceTitle);
    const target = this.presets.get(targetTitle);

    if (!source || !target) {
      console.warn(
        `Copy failed: Source (${sourceTitle}) or Target (${targetTitle}) missing.`,
      );
      return;
    }

    (Object.keys(source) as LayerType[]).forEach((layer) => {
      target[layer].set(source[layer]);
    });
  }

  public getMapDataForExport(
    title: string,
  ): Record<string, { x: number; y: number; v: number }[]> {
    const preset = this.presets.get(title);
    if (!preset) return {};

    const size = Math.sqrt(preset.elevation.length);
    const exportData: Record<string, { x: number; y: number; v: number }[]> =
      {};

    (Object.keys(preset) as LayerType[]).forEach((layerName) => {
      const buffer = preset[layerName];
      const points: { x: number; y: number; v: number }[] = [];

      for (let i = 0; i < buffer.length; i++) {
        const value = buffer[i];

        points.push({
          x: i % size,
          y: Math.floor(i / size),
          v: value,
        });
      }

      exportData[layerName] = points;
    });

    return exportData;
  }

  public getPresetSize(title: string): number {
    const data = this.presets.get(title);
    return data ? Math.sqrt(data.elevation.length) : 129;
  }

  public reset() {
    this.presets.clear();
    this.createPreset("DEFAULT", 129);
  }

  public resizePreset(title: string, newSize: number) {
    if (this.presets.has(title)) {
      const isActive = this.activePresetTitle === title;
      this.createPreset(title, newSize, isActive);
    }
  }
}

export const worldManager = new WorldManager();
