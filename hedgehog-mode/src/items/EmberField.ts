// EmberField is the shared pool of embers and smoke puffs: nozzle sparks,
// burn-line embers, collapse bursts. One field per game, created lazily by
// WorldFx consumers. Fixed pools — when a pool is full the oldest particle
// is recycled so a collapse burst still lands during a heavy burn.

import { Container, Sprite } from "pixi.js";
import { GameElement, HedgehogModeInterface, UpdateTicker } from "../types";
import { Vec } from "../misc/geometry";
import { getPyroTextures } from "../misc/textures";

export const EMBER_POOL = 300;
export const SMOKE_POOL = 80;

const EMBER_GRAVITY = 420;

export type EmitOptions = {
  vx?: [number, number];
  vy?: [number, number];
};

export type EmberParticle = {
  sprite: Sprite;
  age: number;
  life: number;
  vx: number;
  vy: number;
  spin: number;
  live: boolean;
};

type SmokeParticle = {
  sprite: Sprite;
  age: number;
  life: number;
  vx: number;
  vy: number;
  live: boolean;
};

const rand = (range: [number, number]): number =>
  range[0] + Math.random() * (range[1] - range[0]);

export class EmberField implements GameElement {
  isInteractive = false;
  isFlammable = false;

  readonly container = new Container();
  private readonly embers: EmberParticle[] = [];
  private readonly smokes: SmokeParticle[] = [];

  constructor(private game: HedgehogModeInterface) {
    const textures = getPyroTextures(game.app.renderer);

    for (let i = 0; i < EMBER_POOL; i++) {
      const sprite = new Sprite(textures.square);
      sprite.anchor.set(0.5);
      sprite.blendMode = "add";
      sprite.visible = false;
      this.container.addChild(sprite);
      this.embers.push({
        sprite,
        age: 0,
        life: 1,
        vx: 0,
        vy: 0,
        spin: 0,
        live: false,
      });
    }

    for (let i = 0; i < SMOKE_POOL; i++) {
      const sprite = new Sprite(textures.disc);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      sprite.tint = 0x2e2e2e;
      this.container.addChild(sprite);
      this.smokes.push({ sprite, age: 0, life: 1, vx: 0, vy: 0, live: false });
    }

    this.game.worldFx.fx.addChild(this.container);
  }

  emitEmbers(at: Vec, count: number, opts: EmitOptions = {}): void {
    for (let i = 0; i < count; i++) {
      const ember =
        this.embers.find((p) => !p.live) ??
        this.embers.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b));

      ember.age = 0;
      ember.life = 1.2 + Math.random() * 0.8;
      ember.vx = rand(opts.vx ?? [-90, 90]);
      ember.vy = rand(opts.vy ?? [-160, 20]);
      ember.spin = (Math.random() - 0.5) * 12;
      ember.live = true;

      ember.sprite.position.set(at.x, at.y);
      ember.sprite.scale.set(0.5 + Math.random() * 0.5);
      ember.sprite.alpha = 1;
      ember.sprite.tint = 0xffe08a;
      ember.sprite.visible = true;
    }
  }

  emitSmoke(at: Vec, count: number, opts: EmitOptions = {}): void {
    for (let i = 0; i < count; i++) {
      const smoke =
        this.smokes.find((p) => !p.live) ??
        this.smokes.reduce((a, b) => (a.age / a.life > b.age / b.life ? a : b));

      smoke.age = 0;
      smoke.life = 1.5 + Math.random() * 1.0;
      smoke.vx = rand(opts.vx ?? [-15, 15]);
      smoke.vy = rand(opts.vy ?? [-70, -30]);
      smoke.live = true;

      smoke.sprite.position.set(at.x, at.y);
      smoke.sprite.scale.set(0.6);
      smoke.sprite.alpha = 0.3;
      smoke.sprite.visible = true;
    }
  }

  liveEmbers(): number {
    return this.embers.filter((p) => p.live).length;
  }

  totalEmbers(): number {
    return this.embers.length;
  }

  firstLiveEmber(): EmberParticle | undefined {
    return this.embers.find((p) => p.live);
  }

  firstLiveSmoke(): SmokeParticle | undefined {
    return this.smokes.find((p) => p.live);
  }

  update(ticker: UpdateTicker): void {
    const dt = ticker.deltaTime;

    for (const ember of this.embers) {
      if (!ember.live) {
        continue;
      }
      ember.age += dt;
      if (ember.age >= ember.life) {
        ember.live = false;
        ember.sprite.visible = false;
        continue;
      }

      ember.vy += EMBER_GRAVITY * dt;
      ember.vx *= 1 - 1.5 * dt;
      ember.sprite.position.x += ember.vx * dt;
      ember.sprite.position.y += ember.vy * dt;
      ember.sprite.rotation += ember.spin * dt;

      const t = ember.age / ember.life;
      // Bright yellow → orange → black, fading out in the last third.
      ember.sprite.tint = t < 0.5 ? 0xffe08a : t < 0.8 ? 0xff5a00 : 0x1a1a1a;
      ember.sprite.alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    }

    for (const smoke of this.smokes) {
      if (!smoke.live) {
        continue;
      }
      smoke.age += dt;
      if (smoke.age >= smoke.life) {
        smoke.live = false;
        smoke.sprite.visible = false;
        continue;
      }

      smoke.sprite.position.x += smoke.vx * dt;
      smoke.sprite.position.y += smoke.vy * dt;
      const t = smoke.age / smoke.life;
      smoke.sprite.scale.set(0.6 + t * 2.2);
      smoke.sprite.alpha = 0.3 * (1 - t);
    }
  }

  beforeUnload(): void {
    this.game.worldFx.fx.removeChild(this.container);
    this.container.destroy({ children: true });
  }
}
