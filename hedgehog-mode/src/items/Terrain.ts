import { Game, GameElement } from "../types";
import Matter from "matter-js";
import { createNoise2D } from "simplex-noise";
import alea from "alea";
import { COLLISIONS } from "../misc/collisions";
import { Graphics } from "pixi.js";

type TerrainOpts = {
  segmentWidth?: number; // horizontal sampling resolution  (px)
  amplitude?: number; // max height above baseline       (px)
  frequency?: number; // “wiggliness” (octaves of noise)
  baseline?: number; // baseline distance from bottom   (px)
  seed?: string | number;
  octaves?: number;
  persistence?: number;
};

export class Terrain implements GameElement {
  graphics = new Graphics();
  rigidBody!: Matter.Body; // regenerated whenever we carve
  isInteractive = false; // ground doesn’t get pointer events
  isFlammable = true;

  private readonly opts: Required<TerrainOpts>;
  private readonly width: number;
  private readonly heightmap: number[] = []; // y-values (from bottom)
  private readonly noise2D: (x: number, y: number) => number;
  private readonly game: Game;

  constructor(game: Game, opts: TerrainOpts = {}) {
    this.game = game;
    this.opts = {
      segmentWidth: 8,
      amplitude: 120,
      frequency: 1.2,
      baseline: 180,
      seed: Math.random(),
      octaves: 1,
      persistence: 0.5,
      ...opts,
    };

    this.noise2D = createNoise2D(alea(this.opts.seed.toString()));
    this.width = window.innerWidth * 3; // match Ground default

    this.generateHeightmap();
    this.buildGraphics();
    this.buildRigidBody();
    game.app.stage.addChild(this.graphics);
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */

  /* ------------------------------------------------------------------ */

  /** Remove a circular chunk of terrain (e.g. when a grenade explodes) */
  carveCircle(cx: number, cy: number, r: number): void {
    // 1. Find column indices affected by the crater
    const minX = Math.max(0, Math.floor((cx - r) / this.opts.segmentWidth));
    const maxX = Math.min(
      this.heightmap.length - 1,
      Math.ceil((cx + r) / this.opts.segmentWidth),
    );

    let modified = false;
    for (let i = minX; i <= maxX; i++) {
      const x = i * this.opts.segmentWidth;
      const worldY = window.innerHeight - this.heightmap[i];
      const dist = Math.hypot(cx - x, cy - worldY);
      if (dist < r) {
        const dy = Math.sqrt(r * r - (cx - x) ** 2);
        // new ground is the *lowest* y-value that survives the blast
        const newY = window.innerHeight - (cy + dy);
        if (newY < this.heightmap[i]) {
          this.heightmap[i] = Math.max(0, newY); // clamp to the bottom
          modified = true;
        }
      }
    }

    if (modified) {
      this.rebuild();
    }
  }

  update(): void {
    /* nothing - terrain is static apart from craters */
  }

  /* ------------------------------------------------------------------ */
  /*  Generation + helpers                                               */

  /* ------------------------------------------------------------------ */

  private generateHeightmap() {
    const cols = Math.ceil(this.width / this.opts.segmentWidth);
    for (let i = 0; i < cols; i++) {
      const t = i / cols; // 0-1
      const noise = this.fbm(t * this.opts.frequency);
      const y =
        this.opts.baseline +
        noise * this.opts.amplitude +
        Math.sin(t * Math.PI * 2) * this.opts.amplitude * 0.25; // optional sine for variety
      this.heightmap.push(y);
    }
  }

  private fbm(x: number): number {
    let total = 0,
      amp = 1,
      freq = 1;
    for (let o = 0; o < this.opts.octaves; o++) {
      total += this.noise2D(x * freq, 0) * amp;
      amp *= this.opts.persistence;
      freq *= 2;
    }
    return total * 0.5 + 0.5; // normalise → 0‒1
  }

  public buildGraphics() {
    const g = this.graphics;
    g.clear();
    g.beginFill(0x4d3b2a); // brown; swap with textured sprite if you like
    g.moveTo(0, window.innerHeight);
    this.heightmap.forEach((h, i) => {
      g.lineTo(i * this.opts.segmentWidth, window.innerHeight - h);
    });
    g.lineTo(this.width, window.innerHeight);
    g.endFill();
  }

  private buildRigidBody() {
    // 1. World-space vertices (same ones you use for PIXI)
    const vertsWorld = [
      ...this.heightmap.map((h, i) => ({
        x: i * this.opts.segmentWidth,
        y: window.innerHeight - h,
      })),
      { x: this.width, y: window.innerHeight }, // close along the bottom
      { x: 0,        y: window.innerHeight },
    ];

    // 2. Throw away any previous body
    if (this.rigidBody) {
      Matter.Composite.remove(this.game.engine.world, this.rigidBody);
    }

    // 3. Build the body *in world-space* (no extra centring)
    this.rigidBody = Matter.Bodies.fromVertices(
      0,                     // x (ignored – see translate below)
      0,                     // y
      [vertsWorld] as unknown as Matter.Vector[][],
      {
        isStatic: true,
        label: "Terrain",
        collisionFilter: {
          category: COLLISIONS.GROUND,
          mask:    COLLISIONS.PLATFORM |
                   COLLISIONS.ACTOR    |
                   COLLISIONS.PROJECTILE,
        },
      },
      false,                 // flagInternal – keep concave outline
      0.01                   // remove perfectly straight segments only
    );

    /* 4. Snap the body so its bottom-left corner is (0, window.innerHeight) */
    Matter.Body.translate(this.rigidBody, {
      x: -this.rigidBody.bounds.min.x,                       // ← flush to 0
      y: window.innerHeight - this.rigidBody.bounds.max.y,   // ↓ flush to bottom
    });

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  /** graphics + rigid body need refreshing after craters */
  public rebuild() {
    this.buildGraphics();
    this.buildRigidBody();
  }
}
