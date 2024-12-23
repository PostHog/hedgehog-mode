import { Ticker } from "pixi.js";
import { Actor } from "./Actor";
import { Game } from "../types";

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
    game: Game,
    private options: HedgehogActorOptions
  ) {
    super(game);
    this.loadSprite("skins/default/jump/tile");

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
    // this.xVelocity = Math.random() * 2 - 1;
  }

  update(ticker: Ticker): void {
    super.update(ticker);

    if (
      this.yVelocity > 0.5 &&
      this.currentAnimation !== "skins/default/fall/tile"
    ) {
      this.updateSprite("skins/default/fall/tile");
    }
  }
}
