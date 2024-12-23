import { Application } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";
import type { Actor } from "./actors/Actor";
import type { Box } from "./scene/Box";

export type HedgehogModeConfig = {
  assetsUrl: string;
};

export type BoundingRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type GameObject = {
  bounds: BoundingRect;
  hitArea: BoundingRect;
};

export type Game = {
  app: Application;
  pointerEventsEnabled: boolean;
  spritesManager: SpritesManager;
  elapsed?: number;
  actors: Actor[];
  boxes: Box[];
};
