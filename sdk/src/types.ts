import { AnimatedSprite } from "pixi.js";

export type HedgehogModeConfig = {
  assetsUrl: string;
};

export type Actor = {
  sprite: AnimatedSprite;
  update(): void;
};
