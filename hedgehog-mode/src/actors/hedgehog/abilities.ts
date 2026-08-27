import gsap from "gsap";
import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import { SpiderWebActor } from "../../items/SpiderWebActor";
import { FlameActor } from "../../items/Flame";
import { HOUR_MS, oncePerInterval } from "../../misc/storage";

/**
 * A skin-specific active behaviour bound to a single hedgehog. Built by the
 * skin registry (see ./skins.ts) and owned by the actor for its lifetime.
 */
export interface HedgehogSkinAbility {
  /** Trigger the skin's "fire" action (the `f` key). No-op if unsupported. */
  fire?(): void;
  /** Detach listeners / tear down any owned state. */
  destroy(): void;
}

/**
 * Spiderhog web-slinging. A pointer down spawns a web pinned at the cursor and
 * attached to the hog; dragging moves the anchor; releasing detaches it so it
 * drifts off on its own. Only one web is slung at a time. Owns — and crucially
 * cleans up — its global listeners.
 */
export class SpiderHogAbility implements HedgehogSkinAbility {
  private activeWeb?: SpiderWebActor;
  private activePointerId?: number;

  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {
    window.addEventListener("pointerdown", this.onPointerDown);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (
      this.activeWeb ||
      this.actor.options.skin !== "spiderhog" ||
      this.actor.isDead
    ) {
      return;
    }

    const web = SpiderWebActor.spawn(this.game, this.actor, {
      x: e.clientX,
      y: e.clientY,
    });
    if (!web) {
      return;
    }

    this.activeWeb = web;
    this.activePointerId = e.pointerId;
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);

    // Hint at the climb controls the first time the player slings — at most once
    // a day so it isn't nagging.
    if (
      this.actor.options.player &&
      this.game.gameUI &&
      oncePerInterval("web-climb-hint", HOUR_MS)
    ) {
      this.game.gameUI.flash({
        words: [
          "nice sling! press",
          { text: "W", style: { fontWeight: "bold" } },
          "/",
          { text: "S", style: { fontWeight: "bold" } },
          "to climb the web",
        ],
        actor: this.actor,
        duration: 5000,
      });
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) {
      return;
    }
    this.activeWeb?.moveAnchor({ x: e.clientX, y: e.clientY });
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointerId) {
      return;
    }
    this.endSling();
  };

  private endSling(): void {
    this.activeWeb?.release();
    this.activeWeb = undefined;
    this.activePointerId = undefined;
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
  }

  destroy(): void {
    this.endSling();
    window.removeEventListener("pointerdown", this.onPointerDown);
  }
}

/** Hogzilla breathes fire — a fireball in the direction it's facing. */
export class HogzillaAbility implements HedgehogSkinAbility {
  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {}

  fire(): void {
    const direction = this.actor.getDirection();
    const body = this.actor.rigidBody!;
    FlameActor.spawnFireball(
      this.game,
      {
        x: body.position.x + (direction === "left" ? -10 : 10),
        // Y is slightly above the hedgehog
        y: body.position.y - this.actor.sprite!.height * 0.3,
      },
      {
        x: direction === "left" ? -10 : 10,
        y: -10,
      }
    );
  }

  destroy(): void {}
}

// Catherine wheel: a firework pinned to the hog. Lighting it spins him through
// a couple of full turns while sparks fly off the rim, thrown outward along
// whatever angle the wheel has reached. Reusable — once it burns out he can
// light it again.
const BURN_DURATION_S = 3;
const SPIN_ROTATIONS = 2;
const SPARKS_PER_SECOND = 20;
const SPIN_ANGLE = SPIN_ROTATIONS * Math.PI * 2;
const SPARKS_PER_BURN = BURN_DURATION_S * SPARKS_PER_SECOND;
const SPARK_SPEED = 8;
// Fraction either side of SPARK_SPEED, so the ring of sparks isn't uniform.
const SPARK_SPEED_JITTER = 0.25;
// Where on the hog the sparks leave from, as a fraction of sprite width.
const RIM_OFFSET = 0.3;

export class CatherineWheelAbility implements HedgehogSkinAbility {
  // Tweened 0 -> SPIN_ANGLE by gsap and written onto the actor, which
  // is what actually rotates him (Actor.update copies forceAngle onto the body).
  private angle = 0;
  private burning = false;
  private sparksEmitted = 0;

  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {}

  fire(): void {
    // controls.ts re-fires every 100ms while `f` is held. Without this guard the
    // tween restarts ten times a second and the wheel never finishes a turn.
    if (this.burning) {
      return;
    }

    this.burning = true;
    this.angle = 0;
    this.sparksEmitted = 0;

    gsap.to(this, {
      angle: SPIN_ANGLE,
      duration: BURN_DURATION_S,
      ease: "none",
      onUpdate: () => {
        this.actor.forceAngle = this.angle;
        this.emitSparksDue();
      },
      onComplete: () => this.extinguish(),
    });
  }

  /**
   * Sparks are spread evenly over the burn and thrown along whatever angle the
   * wheel has reached, so how many are owed is just how far the spin has got.
   * Driving them off the tween rather than a timer of their own keeps the whole
   * firework on the game's clock: they stop dead when the engine stops (which a
   * torn-down game never restarts) and they stretch and shrink with setSpeed,
   * exactly as the spin does.
   */
  private emitSparksDue(): void {
    const due = Math.floor((this.angle / SPIN_ANGLE) * SPARKS_PER_BURN);

    while (this.sparksEmitted < due) {
      this.sparksEmitted++;
      this.emitSpark();
    }
  }

  private emitSpark(): void {
    const body = this.actor.rigidBody;
    if (!body) {
      return;
    }

    const reach = Math.abs(this.actor.sprite?.width ?? 0) * RIM_OFFSET;
    const jitter = 1 + (Math.random() - 0.5) * 2 * SPARK_SPEED_JITTER;
    const speed = SPARK_SPEED * jitter;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    FlameActor.spawnFireball(
      this.game,
      { x: body.position.x + cos * reach, y: body.position.y + sin * reach },
      { x: cos * speed, y: sin * speed }
    );
  }

  private extinguish(): void {
    this.actor.forceAngle = 0;
    this.angle = 0;
    this.burning = false;
  }

  destroy(): void {
    gsap.killTweensOf(this);
    this.extinguish();
  }
}
