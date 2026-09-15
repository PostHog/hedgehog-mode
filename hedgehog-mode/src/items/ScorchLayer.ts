// ScorchLayer keeps the scorch marks a burn leaves behind: one Graphics in
// the `under` layer (below everything else) with a dark ellipse plus a ring
// of ember dots that cool from orange to black. Marks fade out over
// SCORCH_LIFETIME_S and are dropped.

import { Graphics } from "pixi.js";
import { GameElement, HedgehogModeInterface, UpdateTicker } from "../types";
import { Rect, Side } from "../misc/geometry";

export const MAX_SCORCH_MARKS = 60;
const SCORCH_LIFETIME_S = 20;
const DOT_COUNT = 6;

type Mark = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  age: number;
  dots: { x: number; y: number }[];
};

export class ScorchLayer implements GameElement {
  isInteractive = false;
  isFlammable = false;

  readonly graphics = new Graphics();
  private marks: Mark[] = [];

  constructor(private game: HedgehogModeInterface) {
    this.game.worldFx.under.addChild(this.graphics);
  }

  mark(rect: Rect, side: Side, progress: number): void {
    if (this.marks.length >= MAX_SCORCH_MARKS) {
      this.marks.shift();
    }

    // Sit just inside the ignition edge.
    const x =
      side === "left"
        ? rect.x + rect.width * 0.25
        : side === "right"
          ? rect.x + rect.width * 0.75
          : rect.x + rect.width / 2;
    const y =
      side === "top"
        ? rect.y + rect.height * 0.25
        : side === "bottom"
          ? rect.y + rect.height * 0.75
          : rect.y + rect.height / 2;

    const dots: { x: number; y: number }[] = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const angle = (i / DOT_COUNT) * Math.PI * 2 + Math.random();
      dots.push({
        x: x + Math.cos(angle) * rect.width * 0.45,
        y: y + Math.sin(angle) * rect.height * 0.45,
      });
    }

    this.marks.push({
      x,
      y,
      rx: rect.width * 0.4,
      ry: 10 + 30 * progress,
      age: 0,
      dots,
    });
  }

  markCount(): number {
    return this.marks.length;
  }

  update(ticker: UpdateTicker): void {
    if (this.marks.length === 0) {
      return;
    }

    for (const mark of this.marks) {
      mark.age += ticker.deltaTime;
    }
    this.marks = this.marks.filter((mark) => mark.age < SCORCH_LIFETIME_S);

    const graphics = this.graphics;
    graphics.clear();
    for (const mark of this.marks) {
      const fade = 1 - mark.age / SCORCH_LIFETIME_S;
      graphics
        .ellipse(mark.x, mark.y, mark.rx, mark.ry)
        .fill({ color: 0x0a0a0a, alpha: 0.55 * fade });

      // Ember dots cool from orange to black over their first six seconds.
      const cool = Math.min(1, mark.age / 6);
      const r = Math.round(0xff - cool * 0xff);
      const g = Math.round(0x7a - cool * 0x7a);
      for (const dot of mark.dots) {
        graphics
          .circle(dot.x, dot.y, 1.5)
          .fill({ color: (r << 16) | (g << 8), alpha: fade });
      }
    }
  }

  beforeUnload(): void {
    this.game.worldFx.under.removeChild(this.graphics);
    this.graphics.destroy();
    this.marks = [];
  }
}
