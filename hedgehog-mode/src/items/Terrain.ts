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
    // 1. World-space vertices *closed* with a baseline so bounds are correct
    const vertsWorld = [
      ...this.heightmap.map((h, i) => ({
        x: i * this.opts.segmentWidth,
        y: window.innerHeight - h,
      })),
      { x: this.width, y: window.innerHeight }, // right-hand corner
      { x: 0,         y: window.innerHeight },  // back to origin
    ];

    // // 2. Find their bounding box and centre
    const centre = Matter.Vertices.centre(
      vertsWorld as unknown as Matter.Vertices,
    );

    // 3. Convert to **local** coordinates for the body
    const vertsLocal = vertsWorld.map((v) => ({
      x: v.x - centre.x,
      y: v.y - centre.y,
    }));

    // 4. Kill the old body (if any) and add the new one
    if (this.rigidBody) {
      Matter.Composite.remove(this.game.engine.world, this.rigidBody);
    }
    this.rigidBody = Matter.Bodies.fromVertices(
      centre.x,
      centre.y,
      [vertsLocal] as unknown as Matter.Vector[][], // one vertex-set
      {
        isStatic: true,
        label: "Terrain",
        collisionFilter: {
          category: COLLISIONS.GROUND,
          mask: COLLISIONS.PLATFORM |
                COLLISIONS.ACTOR     |
                COLLISIONS.PROJECTILE,
        },
      },
      /* flagInternal    */ false,  // keep the concave outline
      /* removeCollinear */ 0.01,   // only drop *perfectly* straight segments
    );
    const desiredTop = Math.min(...vertsWorld.map(v => v.y));             // y of real surface
    const actualTop  = this.rigidBody.bounds.min.y;                       // y after Matter shifts it
    Matter.Body.translate(this.rigidBody, { x: 0, y: desiredTop - actualTop });

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  /** graphics + rigid body need refreshing after craters */
  public rebuild() {
    this.buildGraphics();
    this.buildRigidBody();
  }
}
