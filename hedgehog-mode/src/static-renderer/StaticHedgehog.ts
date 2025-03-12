import { Application, ColorMatrixFilter, Container, Sprite } from "pixi.js";
import { COLOR_TO_FILTER_MAP, HedgehogActorOptions } from "../actors/Hedgehog";
import { AvailableSpriteFrames, SpritesManager } from "../sprites/sprites";
import { HedgehogModeConfig } from "../types";

export type StaticHedgehogRenderOptions = HedgehogActorOptions;

export class StaticHedgehogRenderer {
  private resultCache: Map<string, string> = new Map();
  private renderingCache: Map<string, Promise<string>> = new Map();
  private app: Application;
  private spritesManager: SpritesManager;
  private initPromise: Promise<void> | null = null;

  constructor(options: HedgehogModeConfig) {
    this.app = new Application();
    this.spritesManager = new SpritesManager(options);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initialize();
    }
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    await this.spritesManager.load();
    await this.app.init({
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      roundPixels: true,
    });
  }

  private createContainer(options: StaticHedgehogRenderOptions): Container {
    const container = new Container();
    const filter = new ColorMatrixFilter();

    // Create base sprite
    const spriteName = `skins/${options.skin ?? "default"}/wave/tile000.png`;
    const frame = this.spritesManager.getSpriteFrames(
      spriteName as AvailableSpriteFrames
    );
    if (!frame) {
      throw new Error(`Sprite not found: ${spriteName}`);
    }

    const sprite = new Sprite(frame);
    sprite.anchor.set(0.5);
    sprite.filters = [filter];
    container.addChild(sprite);

    // Center the container
    container.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );

    // Add accessories
    options.accessories?.forEach((accessory) => {
      const accessoryFrame = this.spritesManager.getSpriteFrames(
        `accessories/${accessory}.png`
      );

      if (!accessoryFrame) {
        return;
      }

      const accessorySprite = new Sprite(accessoryFrame);
      accessorySprite.anchor.set(0.5);
      sprite.addChild(accessorySprite);
    });

    // Apply color filter
    if (options.color) {
      const colorFilter = COLOR_TO_FILTER_MAP[options.color];
      filter.reset();
      colorFilter?.(filter);
    }

    return container;
  }

  private getOptionsHash(options: StaticHedgehogRenderOptions): string {
    return JSON.stringify({
      skin: options.skin,
      color: options.color,
      accessories: options.accessories?.sort(),
    });
  }

  private async renderToDataURL(container: Container): Promise<string> {
    if (!this.app.renderer) {
      throw new Error("PIXI renderer not initialized");
    }

    this.app.stage.addChild(container);
    const texture = this.app.renderer.generateTexture(container);
    const canvas = this.app.renderer.extract.canvas(texture);
    const dataURL = canvas.toDataURL("image/png");

    texture.destroy();
    this.app.stage.removeChild(container);
    container.destroy();

    return dataURL;
  }

  private async performRender(
    options: StaticHedgehogRenderOptions
  ): Promise<string> {
    await this.ensureInitialized();
    const container = this.createContainer(options);
    const dataURL = await this.renderToDataURL(container);
    return dataURL;
  }

  public async render(options: StaticHedgehogRenderOptions): Promise<string> {
    const hash = this.getOptionsHash(options);

    // Check the result cache first
    const cachedResult = this.resultCache.get(hash);
    if (cachedResult) {
      return cachedResult;
    }

    // Check if this render is already in progress
    let renderPromise = this.renderingCache.get(hash);
    if (!renderPromise) {
      // Create new render promise
      renderPromise = this.performRender(options)
        .then((result) => {
          // Store in result cache when complete
          this.resultCache.set(hash, result);
          // Remove from rendering cache
          this.renderingCache.delete(hash);
          return result;
        })
        .catch((error) => {
          // Clean up cache on error
          this.renderingCache.delete(hash);
          throw error;
        });

      // Store the promise in the rendering cache
      this.renderingCache.set(hash, renderPromise);
    }

    return renderPromise;
  }

  public destroy(): void {
    this.resultCache.clear();
    this.renderingCache.clear();
    this.app.destroy(true);
    this.initPromise = null;
  }

  public clearCache(): void {
    this.resultCache.clear();
    this.renderingCache.clear();
  }
}
