import { Ticker } from "pixi.js";
import { BoundingRect, Game, GameObject } from "../types";

// Defines a box that is something other actors will interact with
export class Box implements GameObject {
  protected x = 0;
  protected y = 0;
  protected width = 1;
  protected height = 1;

  constructor(protected game: Game) {}

  get bounds(): BoundingRect {
    return {
      x: this.x,
      y: this.y,
      width: 100, // TODO
      height: 100, // TODO
    };
  }

  get hitArea(): BoundingRect {
    return this.bounds;
  }

  update(ticker: Ticker): void {}
}
