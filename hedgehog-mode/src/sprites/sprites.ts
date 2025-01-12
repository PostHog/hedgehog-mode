import { AnimatedSpriteFrames, Assets, Spritesheet, Texture } from "pixi.js";
import sprites from "../../assets/sprites.json";
import { HedgehogModeConfig } from "../types";

export type AvailableAnimations = keyof typeof sprites.animations;
export type AvailableSpriteFrames = keyof typeof sprites.frames;

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

  getAnimatedSpriteFrames(
    animation: AvailableAnimations
  ): AnimatedSpriteFrames {
    return this.spritesheet.animations[animation];
  }

  getSpriteFrames(name: AvailableSpriteFrames): Texture {
    return this.spritesheet.textures[name];
  }
}
