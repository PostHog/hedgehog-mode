import Matter from "matter-js";
import { Graphics } from "pixi.js";
import { Game, GameElement, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";
import { Projectile } from "./Projectile";

/**
 * FloatingPlatform – stripy soil with rounded corners (top & bottom).
 *
 * 1. Rounded silhouette (single drawRoundedRect)
 * 2. Soil strata painted inside (respect radius so the curve shows)
 * 3. Grass cap on top
 * 4. Spiky underside (starts inset so spikes don’t overlap corners)
 */
export class FloatingPlatform implements GameElement {
  rigidBody: Matter.Body;
  isInteractive = false;
  isFlammable = true;

  private gfx: Graphics;
  private readonly baselineY: number;
  private readonly amplitude: number;
  private readonly period: number;

  constructor(
    private game: Game,
    opts: {
      x: number;
      y: number;
      width?: number;
      height?: number;
      amplitude?: number;
      period?: number;
    }
  ) {
    const { x, y } = opts;
    const w = opts.width ?? 150;
    const h = opts.height ?? 30;

    /* ——————————————————— physics body ——————————————————— */
    this.rigidBody = Matter.Bodies.rectangle(x, y, w, h, {
      isStatic: true,
      label: "FloatingPlatform",
      collisionFilter: {
        category: COLLISIONS.PLATFORM,
        mask: COLLISIONS.ACTOR | COLLISIONS.PROJECTILE,
      },
    });
    Matter.Composite.add(this.game.engine.world, this.rigidBody);

    /* ——————————————————— visuals ——————————————————— */
    this.gfx = new Graphics();

    const MID_DIRT   = 0x4d3b2a;
    const DARK_SOIL  = 0x3b2b1b;
    const BASE_GRASS = 0x5ba94c;
    const SOIL_STRATA = [0x6e563e, 0x4f3a28, 0x3b2b1b] as const;

    const GRASS_H   = 10;
    const RADIUS    = 8;   // corner radius for both top & bottom
    const STRIPE_H  = 6;

    /* 1️⃣ rounded silhouette */
    this.gfx.beginFill(MID_DIRT);
    this.gfx.drawRoundedRect(-w / 2, -h / 2, w, h, RADIUS);
    this.gfx.endFill();

    /* 2️⃣ horizontal strata inside silhouette */
    let stripeY = -h / 2;
    let idx = 0;
    while (stripeY < h / 2 - 1) {
      const height = Math.min(STRIPE_H, h / 2 - stripeY);
      const baseCol = SOIL_STRATA[idx % SOIL_STRATA.length];

      this.gfx.beginFill(baseCol);
      // keep a margin equal to radius so the rounded corners stay visible
      this.gfx.drawRect(-w / 2 + RADIUS, stripeY, w - RADIUS * 2, height);
      this.gfx.endFill();

      stripeY += height;
      idx++;
    }

    /* 3️⃣ grass cap */
    this.gfx.beginFill(BASE_GRASS);
    this.gfx.drawRoundedRect(-w / 2, -h / 2 - GRASS_H, w, GRASS_H, RADIUS);
    this.gfx.endFill();

    /* 4️⃣ spiky underside */
    const STEP = 8;
    const leftInset  = -w / 2 + RADIUS + STEP;
    const rightInset =  w / 2 - RADIUS - STEP;

    for (let xi = leftInset; xi < rightInset; xi += STEP) {
      const depth = 4 + Math.random() * 8;
      this.gfx.beginFill(DARK_SOIL);
      this.gfx.drawPolygon([
        xi,             h / 2,
        xi + STEP,      h / 2,
        xi + STEP / 2,  h / 2 + depth,
      ]);
      this.gfx.endFill();
    }

    this.gfx.alpha = 0.95;
    this.game.app.stage.addChildAt(this.gfx, 0);

    /* ——————————————————— motion ——————————————————— */
    this.baselineY = y;
    this.amplitude = opts.amplitude ?? 60;
    this.period    = opts.period    ?? 4000;

    this.update({ deltaMS: 0, deltaTime: 0 });
  }

  update(_: UpdateTicker): void {
    const elapsed = performance.now() % this.period;
    const offset  = Math.sin((elapsed / this.period) * Math.PI * 2) * this.amplitude;
    const newY    = this.baselineY + offset;

    Matter.Body.setPosition(this.rigidBody, {
      x: this.rigidBody.position.x,
      y: newY,
    });
    this.gfx.position.set(this.rigidBody.position.x, newY);
  }

  onCollisionStart(el: GameElement): void {
    if (el instanceof Projectile) {
      this.game.world.removeElement(this);
    }
  }

  beforeUnload(): void {
    Matter.Composite.remove(this.game.engine.world, this.rigidBody);
    this.game.app.stage.removeChild(this.gfx);
    this.gfx.destroy();
  }
}
