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
  carveCircle(cx: number, cy: number, r: number): void {
    const segW  = this.opts.segmentWidth;
    const minI  = Math.max(0, Math.floor((cx - r) / segW));
    const maxI  = Math.min(this.heightmap.length - 1,
                           Math.ceil((cx + r) / segW));

    let modified = false;

    for (let i = minI; i <= maxI; i++) {
      const x  = i * segW;
      const dx = x - cx;

      if (Math.abs(dx) >= r) continue;           // ① outside horizontal reach

      const dy           = Math.sqrt(r * r - dx * dx);  // ② vertical reach
      const worldY       = cy + dy;                     // lower intersection
      const newHeight    = Math.max(1,                 // ④ keep 1 px film
                         window.innerHeight - worldY); // ③ bottom-based units

      if (newHeight < this.heightmap[i]) {
        this.heightmap[i] = newHeight;
        modified = true;
      }
    }

    if (modified) this.rebuild();
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

    /* ---------------------------------------------------------------
       1.  Main dirt body (same outline as before)
    ----------------------------------------------------------------*/
    const BASE_DIRT = 0x4d3b2a;      // mid-brown
    g.beginFill(BASE_DIRT);
    g.moveTo(0, window.innerHeight);            // bottom-left
    this.heightmap.forEach((h, i) => {
      g.lineTo(i * this.opts.segmentWidth,    // top contour
                 window.innerHeight - h);
    });
    g.lineTo(this.width, window.innerHeight);   // bottom-right
    g.endFill();

    /* ---------------------------------------------------------------
       2.  Ten-pixel-high grass/soil band along the top
    ----------------------------------------------------------------*/
    const GRASS_H = 10;
    const BASE_GRASS = 0x5ba94c;     // pleasant green

    for (let i = 0; i < this.heightmap.length; i++) {
      const x      = i * this.opts.segmentWidth;
      const topY   = window.innerHeight - this.heightmap[i];

      // ± a tiny random tint so the edge looks organic
      const tint   = (Math.random() - 0.5) * 0x002200;
      const colour = Math.max(0,
                     Math.min(0xffffff, BASE_GRASS + tint)) >>> 0;

      g.beginFill(colour);
      g.drawRect(x, topY - GRASS_H, this.opts.segmentWidth, GRASS_H);
      g.endFill();
    }

    /* ---------------------------------------------------------------
       3.  Layered soil veins for visual variation
    ----------------------------------------------------------------*/
    const LAYER_COUNT_RANGE  = [6, 8] as const;           // min / max strata
    const LAYER_THICK_RANGE  = [12, 28] as const;         // px each layer
    const NOISE_FREQ         = 0.12;                      // lower → smoother
    const COLOURS = [
        0x6e563e,   // light brown / ochre
        0x4f3a28,   // mid brown
        0x3b2b1b,   // dark brown
    ];

    const colCount = this.heightmap.length;
    const noise = this.noise2D ?? (() => 0);              // reuse noise if available

    for (let i = 0; i < colCount; i++) {
      const x     = i * this.opts.segmentWidth;
      const topY  = window.innerHeight - this.heightmap[i];

      /* decide how many strata this column gets */
      const strata = Math.floor(
          Math.random() * (LAYER_COUNT_RANGE[1] - LAYER_COUNT_RANGE[0] + 1)
        ) + LAYER_COUNT_RANGE[0];

      let yCursor  = topY + GRASS_H;                    // start just under grass

      for (let s = 0; s < strata; s++) {
        /* thickness with slight random plus noise wobble */
        const baseH   = LAYER_THICK_RANGE[0] +
                       Math.random() * (LAYER_THICK_RANGE[1] - LAYER_THICK_RANGE[0]);
        const jitter  = noise(i * NOISE_FREQ, s) * 6; // ±6 px waviness
        const height  = Math.max(4, baseH + jitter);

        g.beginFill(COLOURS[s % COLOURS.length]);
        g.drawRect(x, yCursor, this.opts.segmentWidth, height);
        g.endFill();

        yCursor += height;                            // next layer starts lower
      }
    }
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
