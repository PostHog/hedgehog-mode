// HedgehogPyro is pyro mode: the flamethrower state on one hedgehog. Like
// the rampage, it is a mode on the actor (not a skin) so it works with every
// skin — hogzilla included, though pyro takes over the `f` key while armed.
//
// The controls tick pullTrigger() every 100 ms while `f` is held; the
// trigger stays "hot" for PYRO_TRIGGER_HOLD_MS after the last tick so the
// stream doesn't stutter between key repeats.

import { HedgehogModeInterface, UpdateTicker } from "../../types";
import { Cone, coneHitsRect } from "../../misc/geometry";
import { BurningElement } from "../../items/BurningElement";
import { FlameStream } from "../../items/FlameStream";
import { PyroRig } from "../../items/PyroRig";
import { SyncedPlatform } from "../../items/SyncedPlatform";
import { getPyroTextures } from "../../misc/textures";
import type { HedgehogActor } from "../Hedgehog";

// How long pyro mode lasts before the rig packs itself away.
export const PYRO_DURATION_MS = 24000;
// Beat of standing still while the rig snaps on, so the draw reads.
const PYRO_INTRO_MS = 1400;
// The flame reaches this far and opens about ±11.5°.
const PYRO_CONE_LENGTH = 260;
const PYRO_CONE_HALF_ANGLE = 0.2;
// Trigger stays hot this long after the last pull (controls tick is 100 ms).
export const PYRO_TRIGGER_HOLD_MS = 160;
// Pixels of screen shake while firing.
const PYRO_SHAKE_PX = 1.5;
// Push against the facing direction per trigger tick.
export const PYRO_RECOIL = 0.6;
// Platform list cache: querySelector work is fine at this cadence.
const PLATFORM_CACHE_MS = 250;
// Ambient embers drifting off the nozzle while armed.
const AMBIENT_EMBER_INTERVAL_S = 0.4;

export class HedgehogPyro {
  private timer?: ReturnType<typeof setTimeout>;
  private triggerHotUntil = 0;
  private rig?: PyroRig;
  private stream?: FlameStream;
  private platforms: SyncedPlatform[] = [];
  private platformsCachedAt = 0;
  private nextAmbientEmber = 0;
  private ending = false;

  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {}

  get isActive(): boolean {
    return !!this.timer;
  }

  /** Arm the flamethrower. Calling again while armed just extends it. */
  start(duration: number = PYRO_DURATION_MS): void {
    if (this.actor.isDead) {
      return;
    }

    const first = !this.isActive;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.end(), duration);

    if (!first) {
      return;
    }

    this.ending = false;
    this.actor.walkSpeed = 0;
    this.actor.ai.pause(PYRO_INTRO_MS);
    this.actor.holdPose("action");

    const textures = getPyroTextures(this.game.app.renderer);
    this.rig = new PyroRig(this.actor, textures);
    setTimeout(() => this.rig?.attach(), 600);
    this.stream = new FlameStream(this.game, textures);
    this.game.elements.push(this.stream);
    this.game.worldFx.fadeGrade(1, 1.0);
    this.actor.interface.announcePyro();
  }

  /** Called every 100 ms by the controls while `f` is held. */
  pullTrigger(): void {
    if (!this.isActive || this.actor.isDead || this.ending) {
      return;
    }
    this.triggerHotUntil = Date.now() + PYRO_TRIGGER_HOLD_MS;

    const direction = this.actor.getDirection() === "left" ? -1 : 1;
    this.actor.setVelocity({
      x: this.actor.rigidBody!.velocity.x - direction * PYRO_RECOIL,
      y: this.actor.rigidBody!.velocity.y,
    });
  }

  update(ticker: UpdateTicker): void {
    if (!this.isActive) {
      return;
    }
    const dt = ticker.deltaTime;

    this.rig?.update(dt);

    // Ambient embers off the nozzle while armed.
    if (this.rig) {
      this.nextAmbientEmber -= dt;
      if (this.nextAmbientEmber <= 0) {
        this.nextAmbientEmber = AMBIENT_EMBER_INTERVAL_S;
        this.game.worldFx.emberField.emitEmbers(
          this.rig.nozzleWorldPosition(),
          1,
          {
            vx: [-30, 30],
            vy: [-120, -60],
          }
        );
      }
    }

    const triggerHot = Date.now() < this.triggerHotUntil;
    if (!triggerHot || !this.rig || !this.stream) {
      this.stream?.idle(dt);
      return;
    }

    const nozzle = this.rig.nozzleWorldPosition();
    const direction = this.actor.getDirection() === "left" ? -1 : 1;
    const cone: Cone = {
      origin: nozzle,
      direction,
      length: PYRO_CONE_LENGTH,
      halfAngleRad: PYRO_CONE_HALF_ANGLE,
    };

    this.stream.emit(nozzle, direction, dt);
    this.game.worldFx.shake(PYRO_SHAKE_PX);

    // Platforms are re-queried on a short cache; the DOM scan is the
    // expensive part, the cone test is not.
    if (Date.now() - this.platformsCachedAt > PLATFORM_CACHE_MS) {
      this.platformsCachedAt = Date.now();
      this.platforms = this.game.elements.filter(
        (element): element is SyncedPlatform =>
          element instanceof SyncedPlatform
      );
    }
    for (const platform of this.platforms) {
      const rect = platform.lastRect ?? platform.ref.getBoundingClientRect();
      if (coneHitsRect(cone, rect)) {
        BurningElement.ignite(
          this.game,
          platform.ref,
          direction === 1 ? "left" : "right"
        );
      }
    }

    // Other hogs in the cone catch fire; never the one holding the nozzle.
    for (const hog of this.game.getAllHedgehogs()) {
      if (hog === this.actor || !hog.sprite) {
        continue;
      }
      const rect = {
        x: hog.sprite.x - hog.sprite.width / 2,
        y: hog.sprite.y - hog.sprite.height / 2,
        width: hog.sprite.width,
        height: hog.sprite.height,
      };
      if (coneHitsRect(cone, rect)) {
        hog.setOnFire(1);
      }
    }
  }

  /** Natural burn-out: pack the rig away and let the grade fade. */
  end(): void {
    if (this.ending || !this.isActive) {
      return;
    }
    this.ending = true;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.triggerHotUntil = 0;

    if (this.stream) {
      this.game.removeElement(this.stream);
      this.stream = undefined;
    }

    const rig = this.rig;
    this.rig = undefined;
    rig?.detach().catch(() => rig.destroy());

    this.game.worldFx.fadeGrade(0, 1.5);

    if (!this.actor.isDead) {
      this.actor.updateSprite("wave", {
        loop: false,
        onComplete: () => this.actor.updateSprite("idle"),
      });
    }
  }

  /** Immediate teardown, called from the actor's beforeUnload(). */
  destroy(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.triggerHotUntil = 0;
    this.rig?.destroy();
    this.rig = undefined;
    if (this.stream) {
      this.game.removeElement(this.stream);
      this.stream = undefined;
    }
  }
}
