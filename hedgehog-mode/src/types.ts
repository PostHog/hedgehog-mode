import type { CSSProperties } from "react";
import type Matter from "matter-js";
import { AnimatedSprite, Application } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";
import type { HedgehogActor } from "./actors/Hedgehog";
import { HedgehogActorOptions } from "./actors/hedgehog/config";

export type UpdateTicker = {
  deltaMS: number;
  deltaTime: number;
};

export type GameElement = {
  readonly sprite?: AnimatedSprite;
  readonly rigidBody?: Matter.Body | null;
  onCollisionStart?: (element: GameElement, pair: Matter.Pair) => void;
  onCollisionEnd?: (element: GameElement, pair: Matter.Pair) => void;
  beforeUnload?: () => void;
  update: (ticker: UpdateTicker) => void;
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
  setSpeed: (speed: number) => void;
  gameUI?: GameUI;
};

export type GameUI = {
  showDialogBox: (dialogBox: GameUIDialogBoxProps) => void;
};

export type GameUIAnimatedTextProps = {
  words: (string | { text: string; style?: CSSProperties })[];
  duration?: number;
  disableAnimation?: boolean;
  onComplete?: () => void;
};

export type GameUIDialogBoxProps = {
  messages: {
    words: GameUIAnimatedTextProps["words"];
    onComplete?: () => void;
  }[];
  width?: number;
  position?: { x: number; y: number };
  onEnd?: () => void;
  actor?: HedgehogActor;
};
