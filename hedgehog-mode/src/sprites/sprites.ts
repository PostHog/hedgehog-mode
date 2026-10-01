import {
  AnimatedSpriteFrames,
  Assets,
  Rectangle,
  Spritesheet,
  Texture,
} from "pixi.js";
import sprites from "../../assets/sprites.json";
import { HedgehogModeConfig } from "../types";

export type AvailableAnimations = keyof typeof sprites.animations;
export type AvailableSpriteFrames = keyof typeof sprites.frames;

export const AvailableSkins: Set<string> = new Set<string>(
  Object.keys(sprites.animations)
    .filter((x) => x.startsWith("skins/"))
    .map((x) => x.split("/")[1])
);

export class SpritesManager {
  spritesheet?: Spritesheet;
  private columnTextures: Record<string, Texture[]> = {};

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
    return this.spritesheet!.animations[animation as string];
  }

  getSpriteFrames(name: AvailableSpriteFrames): Texture {
    return this.spritesheet!.textures[name as string];
  }

  /** A frame sliced into 1px-wide columns (cached), e.g. to wave a flag. */
  getColumnTextures(name: AvailableSpriteFrames): Texture[] {
    const cached = this.columnTextures[name as string];
    if (cached) {
      return cached;
    }
    const texture = this.getSpriteFrames(name);
    const { x, y, width, height } = texture.frame;
    const columns = Array.from(
      { length: width },
      (_, i) =>
        new Texture({
          source: texture.source,
          frame: new Rectangle(x + i, y, 1, height),
        })
    );
    this.columnTextures[name as string] = columns;
    return columns;
  }

  toAvailableAnimation(name: string): AvailableAnimations | null {
    if (Object.keys(sprites.animations).includes(name)) {
      return name as AvailableAnimations;
    }
    return null;
  }
}
