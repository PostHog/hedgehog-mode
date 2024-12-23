import { Ticker } from "pixi.js";
import { Box } from "./Box";

// Defines a box that is something other actors will interact with
// The box can have
export class Floor extends Box {
  update(ticker: Ticker): void {
    this.x = 0;
    this.y = window.innerHeight;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}
