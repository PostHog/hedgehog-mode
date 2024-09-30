import { AnimatedSpriteFrames, Assets, Spritesheet } from "pixi.js";
import sprites from "../../assets/sprites.json";
import { HedgehogModeConfig } from "../types";

export type AvailableAnimations = keyof typeof sprites.animations;

export class SpritesManager {
  spritesheet: Spritesheet;

  constructor(private options: HedgehogModeConfig) {}

  assetUrl(name: string): string {
    return `${this.options.assetsUrl}/${name}`;
  }

  async load(): Promise<void> {
    const texture = await Assets.load(this.assetUrl("sprites.png"));
    this.spritesheet = new Spritesheet(texture, sprites);
    await this.spritesheet.parse();
  }

  getSpriteFrames(animation: AvailableAnimations): AnimatedSpriteFrames {
    return this.spritesheet.animations[animation];
  }
}
