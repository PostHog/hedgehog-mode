import type Matter from "matter-js";
import { AnimatedSprite, Application } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";

export type GameElement = {
  readonly sprite?: AnimatedSprite;
  readonly rigidBody?: Matter.Body;
  onCollisionStart?: (element: GameElement, pair: Matter.Pair) => void;
  onCollisionEnd?: (element: GameElement, pair: Matter.Pair) => void;
  beforeUnload?: () => void;
  update: () => void;
  isPointerOver: boolean;
  isInteractive: boolean;
};

export type HedgehogModeConfig = {
  assetsUrl: string;
};

export type Game = {
  app: Application;
  engine: Matter.Engine;
  pointerEventsEnabled: boolean;
  spritesManager: SpritesManager;
  elapsed?: number;
  elements: GameElement[];
  log: (...args: unknown[]) => void;
};
