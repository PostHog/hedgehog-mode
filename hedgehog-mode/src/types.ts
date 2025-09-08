import type { CSSProperties } from "react";
import type Matter from "matter-js";
import { AnimatedSprite, Application } from "pixi.js";
import type { SpritesManager } from "./sprites/sprites";
import type { HedgehogActor } from "./actors/Hedgehog";
import {
  HedgehogActorAccessoryOption,
  HedgehogActorOptions,
} from "./actors/hedgehog/config";
import type { GameStateManager } from "./state";
import { HedgehogGhostActor } from "./actors/Ghost";
import { Accessory } from "./items/Accessory";

export type { HedgehogActor, HedgehogActorOptions };

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

export type HedgehogModeGameState = {
  options: HedgehogActorOptions;
  hedgehogsById: Record<string, HedgehogActorOptions>;
};

export type HedgehogModeConfig = {
  assetsUrl: string;
  platforms?: {
    // Argument passed to document.querySelectorAll to find items to be used as platforms
    selector?: string;
    // Padding around the viewport to sync platforms
    viewportPadding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    // Minimum width of the platform to be synced - default to 10px
    minWidth?: number;
    // Maximum number of platforms to be synced - default to 500
    maxNumberOfPlatforms?: number;
    // Sync frequency in milliseconds - default to 1000ms
    syncFrequency?: number;
  };
  state?: HedgehogModeGameState;
  onQuit?: (game: HedgehogModeInterface) => void;
};

export type HedgehogModeInterface = {
  options: HedgehogModeConfig;
  app: Application;
  engine: Matter.Engine;
  pointerEventsEnabled: boolean;
  spritesManager: SpritesManager;
  elapsed?: number;
  elements: GameElement[];
  spawnHedgehog: (options?: HedgehogActorOptions) => HedgehogActor;
  spawnHedgehogGhost: (position: Matter.Vector) => HedgehogGhostActor;
  spawnAccessory: (
    accessory: HedgehogActorAccessoryOption,
    position: Matter.Vector
  ) => Accessory;
  getAllHedgehogs: () => HedgehogActor[];
  getPlayableHedgehog: () => HedgehogActor | undefined;
  removeElement: (element: GameElement) => void;
  log: (...args: unknown[]) => void;
  setSpeed: (speed: number) => void;
  gameUI?: GameUI;
  stateManager?: GameStateManager;
  destroy: () => void;
};

export type GameUI = {
  show: (dialogBox: GameUIProps) => void;
  hide: () => void;
  visible: boolean;
};

export type GameUIAnimatedTextProps = {
  words: (string | { text: string; style?: CSSProperties })[];
  duration?: number;
  disableAnimation?: boolean;
  onComplete?: () => void;
  onClick?: () => void;
};

export type GameUIProps = {
  screen: "configuration" | "dialog";
  messages: {
    words: GameUIAnimatedTextProps["words"];
    onComplete?: () => void;
  }[];
  width?: number;
  position?: { x: number; y: number };
  onClose?: () => void;
  actor?: HedgehogActor;
};
