import type { CSSProperties } from "react";
import type Matter from "matter-js";
import { AnimatedSprite, Application } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";
import type { HedgehogActor } from "./actors/Hedgehog";
import { HedgehogActorOptions } from "./actors/hedgehog/config";
import { GameWorld } from "./world";
import { PolySynth } from "tone";
import { Inventory } from "./items/Inventory";

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
  inventory?: Inventory;
};

export type HedgehogModeGameState = {
  hedgehogsById: Record<string, HedgehogActorOptions>;
};

export type HedgehogModeConfig = {
  assetsUrl: string;
  // Argument passed to document.querySelectorAll to find items to be used as platforms
  platformSelector?: string;
  state?: HedgehogModeGameState;
};

export type Game = {
  app: Application;
  engine: Matter.Engine;
  pointerEventsEnabled: boolean;
  spritesManager: SpritesManager;
  elapsed?: number;
  // spawnHedgehog: (options?: HedgehogActorOptions) => HedgehogActor;
  // removeElement: (element: GameElement) => void;
  log: (...args: unknown[]) => void;
  setSpeed: (speed: number) => void;
  getPlayer: () => HedgehogActor | undefined;
  EntryUI?: EntryUI;
  world: GameWorld;
  audioContext?: PolySynth;
};

export type EntryUI = {
  showDialogBox: (dialogBox: EntryUIDialogBoxProps) => void;
};

export type EntryUIAnimatedTextProps = {
  words: (string | { text: string; style?: CSSProperties })[];
  duration?: number;
  disableAnimation?: boolean;
  onComplete?: () => void;
  onClick?: () => void;
};

export type EntryUIDialogBoxProps = {
  messages: {
    words: EntryUIAnimatedTextProps["words"];
    onComplete?: () => void;
  }[];
  width?: number;
  position?: { x: number; y: number };
  onClose?: () => void;
  actor?: HedgehogActor;
};
