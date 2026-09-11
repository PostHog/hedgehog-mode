// FlameStream renders the flamethrower's cone: a fixed pool of additive
// sprites spawned at the nozzle each frame while the trigger is held. No
// Matter bodies (too costly per particle) and no ParticleContainer (pixi
// particle updates compile with `new Function`, which the extension's CSP
// bans). Driven explicitly by HedgehogPyro for ordering; its own update()
// is a no-op.

import { Container, DisplacementFilter, Sprite } from "pixi.js";
import { GameElement, HedgehogModeInterface, UpdateTicker } from "../types";
import { Cone, conePoint } from "../misc/geometry";
import { prefersReducedMotion } from "../misc/motion";
import { PyroTextures } from "../misc/textures";

const POOL_SIZE = 220;
const SPAWN_PER_S = 320;

// Fraction of each spawn batch, and per-kind tuning.
const KINDS = {
  core: {
    share: 0.2,
    life: 0.22,
    speed: [520, 700],
    scale: [0.35, 0.9],
    alpha: 0.9,
  },
  body: {
    share: 0.55,
    life: 0.55,
    speed: [380, 560],
    scale: [0.5, 1.6],
    alpha: 0.75,
  },
  smoke: {
    share: 0.25,
    life: 1.3,
    speed: [160, 260],
    scale: [0.8, 2.6],
    alpha: 0.35,
  },
} as const;

type Kind = keyof typeof KINDS;

const TINTS: Record<Kind, [number, number, number]> = {
  core: [0xffffcc, 0xffcc44, 0xffaa22],
  body: [0xffb040, 0xff6a00, 0xd42a00],
  smoke: [0x3a3a3a, 0x2e2e2e, 0x1a1a1a],
};

type Particle = {
  sprite: Sprite;
  kind: Kind;
  age: number;
  life: number;
  vx: number;
  vy: number;
  phase: number;
  live: boolean;
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolate through a [start, mid, end] tint ramp. */
function tintAt(ramp: [number, number, number], t: number): number {
  const [a, b, c] = ramp;
  const half = t < 0.5 ? 0 : 1;
  const from = half === 0 ? a : b;
  const to = half === 0 ? b : c;
  const k = half === 0 ? t * 2 : (t - 0.5) * 2;
  const fr = (from >> 16) & 0xff;
  const fg = (from >> 8) & 0xff;
  const fb = from & 0xff;
  const tr = (to >> 16) & 0xff;
  const tg = (to >> 8) & 0xff;
  const tb = to & 0xff;
  return (
    ((fr + (tr - fr) * k) << 16) |
    ((fg + (tg - fg) * k) << 8) |
    (fb + (tb - fb) * k)
  );
}

export class FlameStream implements GameElement {
  isInteractive = false;
  isFlammable = false;
  // Marker so teardown assertions can find us without importing the class.
  readonly isFlameStream = true;

  readonly container = new Container();
  private readonly light: Sprite;
  private readonly noiseSprite?: Sprite;
  private readonly particles: Particle[] = [];
  private spawnCarry = 0;
  private firing = false;
  private elapsed = 0;
  private noiseScroll = { x: 0, y: 0 };

  constructor(
    private game: HedgehogModeInterface,
    textures: PyroTextures
  ) {
    this.container.label = "FlameStream";

    for (let i = 0; i < POOL_SIZE; i++) {
      const sprite = new Sprite(textures.disc);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.container.addChild(sprite);
      this.particles.push({
        sprite,
        kind: "body",
        age: 0,
        life: 1,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        live: false,
      });
    }

    this.light = new Sprite(textures.disc);
    this.light.anchor.set(0.5);
    this.light.blendMode = "add";
    this.light.tint = 0xff9a3c;
    this.light.visible = false;
    this.container.addChild(this.light);

    if (!prefersReducedMotion()) {
      this.noiseSprite = new Sprite(textures.noise);
      this.noiseSprite.renderable = false;
      this.container.filters = [
        new DisplacementFilter({ sprite: this.noiseSprite, scale: 14 }),
      ];
    }

    this.game.worldFx.fx.addChild(this.container);
    if (this.noiseSprite) {
      this.game.app.stage.addChild(this.noiseSprite);
    }
  }

  liveCount(): number {
    return this.particles.filter((p) => p.live).length;
  }

  totalCount(): number {
    return this.particles.length;
  }

  /** Spawn and advance one frame of flame from the nozzle. */
  emit(nozzle: { x: number; y: number }, direction: 1 | -1, dt: number): void {
    this.firing = true;

    const cone: Cone = {
      origin: nozzle,
      direction,
      length: 260,
      halfAngleRad: 0.2,
    };

    this.spawnCarry += SPAWN_PER_S * dt;
    while (this.spawnCarry >= 1) {
      this.spawnCarry -= 1;
      this.spawn(cone);
    }

    // Flickering light at the nozzle.
    this.light.visible = true;
    this.light.position.set(nozzle.x + direction * 30, nozzle.y);
    this.light.scale.set(6.5 + Math.sin(this.elapsed * 60) * 0.8);
    this.light.alpha = 0.32 + Math.random() * 0.1;

    this.advance(dt);
  }

  /** Advance without spawning — flames already out keep dying. */
  idle(dt: number): void {
    this.firing = false;
    this.light.alpha = Math.max(0, this.light.alpha - dt * 4);
    if (this.light.alpha === 0) {
      this.light.visible = false;
    }
    this.advance(dt);
  }

  private spawn(cone: Cone): void {
    const particle = this.particles.find((p) => !p.live) ?? this.oldest();
    const roll = Math.random();
    let kind: Kind = "body";
    let acc = 0;
    for (const k of ["core", "body", "smoke"] as Kind[]) {
      acc += KINDS[k].share;
      if (roll <= acc) {
        kind = k;
        break;
      }
    }

    const tuning = KINDS[kind];
    // Smoke is born further down the stream where the flame breaks up.
    const along = kind === "smoke" ? 40 : 0;
    const position = conePoint(
      cone,
      along + Math.random() * 8,
      (Math.random() - 0.5) * 0.6 * cone.halfAngleRad
    );

    particle.kind = kind;
    particle.age = 0;
    particle.life = tuning.life;
    const speed = lerp(tuning.speed[0], tuning.speed[1], Math.random());
    particle.vx = cone.direction * speed;
    particle.vy = (Math.random() - 0.5) * 80;
    particle.live = true;

    const sprite = particle.sprite;
    sprite.position.set(position.x, position.y);
    sprite.visible = true;
    sprite.blendMode = kind === "smoke" ? "normal" : "add";
    sprite.alpha = tuning.alpha;
    sprite.tint = TINTS[kind][0];
    sprite.scale.set(tuning.scale[0]);
  }

  private oldest(): Particle {
    let oldest = this.particles[0];
    for (const p of this.particles) {
      const ratio = p.age / p.life;
      if (ratio > oldest.age / oldest.life) {
        oldest = p;
      }
    }
    return oldest;
  }

  private advance(dt: number): void {
    this.elapsed += dt;
    for (const particle of this.particles) {
      if (!particle.live) {
        continue;
      }

      particle.age += dt;
      if (particle.age >= particle.life) {
        particle.live = false;
        particle.sprite.visible = false;
        continue;
      }

      const t = particle.age / particle.life;
      const sprite = particle.sprite;

      // Drag and buoyancy: bodies and smoke rise as they slow.
      particle.vx *= 1 - 2.2 * dt;
      if (particle.kind !== "core") {
        particle.vy -= 260 * dt;
      }
      let x = sprite.position.x + particle.vx * dt;
      let y = sprite.position.y + particle.vy * dt;
      // Turbulence so the stream ripples instead of running straight.
      y += Math.sin(particle.phase + particle.age * 18) * 22 * dt;
      sprite.position.set(x, y);

      const tuning = KINDS[particle.kind];
      sprite.alpha = tuning.alpha * (1 - t);
      sprite.tint = tintAt(TINTS[particle.kind], t);
      sprite.scale.set(lerp(tuning.scale[0], tuning.scale[1], t));
    }

    if (this.noiseSprite) {
      this.noiseScroll.x += 180 * dt;
      this.noiseScroll.y -= 60 * dt;
      this.noiseSprite.position.set(
        this.noiseScroll.x % 128,
        this.noiseScroll.y % 128
      );
    }
  }

  update(_ticker: UpdateTicker): void {
    // HedgehogPyro drives emit()/idle() explicitly for ordering.
  }

  beforeUnload(): void {
    this.game.worldFx.fx.removeChild(this.container);
    if (this.noiseSprite) {
      this.game.app.stage.removeChild(this.noiseSprite);
    }
    this.container.destroy({ children: true });
    this.noiseSprite?.destroy();
  }
}
