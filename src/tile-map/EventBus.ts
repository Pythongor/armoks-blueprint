import Phaser from "phaser";

export enum BusEvent {
  CursorMoved = "CursorMoved",
  BrushUpdated = "BrushUpdated",
  LineStart = "LineStart",
  LineEnd = "LineEnd",
  StrokeFinished = "StrokeFinished",
  UpdateCoords = "UpdateCoords",
  UpdateBiome = "UpdateBiome",
  UpdateBiomeDescriptor = "UpdateBiomeDescriptor",
  RequestRedraw = "RequestRedraw",
  PresetSwitched = "PresetSwitched",
}

export const EventBus = new Phaser.Events.EventEmitter();
