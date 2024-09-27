import { Application, Ticker } from "pixi.js";
import { AvailableAnimations, SpritesManager } from "../sprites/sprites";
import { Actor } from "./Actor";

export type HedgehogActorOptions = {
  skin?: string;
  color?: string | null;
  accessories?: string[];
  walking_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
};

export class HedgehogActor extends Actor {
  constructor(
    app: Application,
    spritesManager: SpritesManager,
    private options: HedgehogActorOptions
  ) {
    super(app, spritesManager);

    this.loadSprite("skins/default/action/tile");
    this.setDraggable();

    this.x = Math.min(
      Math.max(0, Math.floor(Math.random() * window.innerWidth)),
      window.innerWidth
    );
    this.y = Math.min(
      Math.max(0, Math.floor(Math.random() * window.innerHeight)),
      window.innerHeight
    );

    this.yVelocity = 2; // Start it with a bounce effect
  }

  protected loadSprite(animation: AvailableAnimations): void {
    // any handlers should be added here
    super.loadSprite(animation);
  }

  update(ticker: Ticker): void {
    super.update(ticker);
  }
}
