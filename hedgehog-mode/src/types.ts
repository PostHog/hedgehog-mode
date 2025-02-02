import type Matter from "matter-js";
import { AnimatedSprite, Application, Ticker } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";
import type { HedgehogActor, HedgehogActorOptions } from "./actors/Hedgehog";

export type GameElement = {
  readonly sprite?: AnimatedSprite;
  readonly rigidBody?: Matter.Body;
  onCollisionStart?: (element: GameElement, pair: Matter.Pair) => void;
  onCollisionEnd?: (element: GameElement, pair: Matter.Pair) => void;
  beforeUnload?: () => void;
  update: (ticker: Ticker) => void;
  isInteractive: boolean;
  isFlammable?: boolean;
};

export type HedgehogModeConfig = {
  assetsUrl: string;
  // Argument passed to document.querySelectorAll to find items to be used as platforms
  platformSelector?: string;
};

export type Game = {
  app: Application;
  engine: Matter.Engine;
  pointerEventsEnabled: boolean;
  spritesManager: SpritesManager;
  elapsed?: number;
  elements: GameElement[];
  spawnHedgehog: (options?: HedgehogActorOptions) => HedgehogActor;
  removeElement: (element: GameElement) => void;
  log: (...args: unknown[]) => void;
};
