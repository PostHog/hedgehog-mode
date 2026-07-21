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
  // Called whenever the engine persists its state (initial spawn, in-app
  // customization, friends changing). When provided, the engine hands persistence
  // entirely to the host and does NOT touch localStorage — pair it with `state` for
  // the initial value. Browser extensions use this to store state in chrome.storage,
  // which (unlike the host page's per-origin localStorage) survives navigation across
  // origins and syncs across windows, sessions and even devices.
  onStateChange?: (state: HedgehogModeGameState) => void;
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

export type GameUIFlashProps = {
  words: GameUIAnimatedTextProps["words"];
  // How long the toast stays up before auto-hiding (ms). Default ~4000.
  duration?: number;
  // Actor to hover the toast above; falls back to bottom-centre if omitted.
  actor?: HedgehogActor;
};

export type GameUI = {
  show: (dialogBox: GameUIProps) => void;
  hide: () => void;
  // Transient, auto-hiding toast with a countdown indicator (distinct from the
  // click-triggered speech bubble shown via `show`).
  flash: (flash: GameUIFlashProps) => void;
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
