import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import { SpiderWebActor } from "../../items/SpiderWebActor";
import { FlameActor } from "../../items/Flame";

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
 * attached to the hog; dragging moves the anchor; releasing detaches it. Tracks
 * webs per pointer id so multitouch slings don't clobber each other. Owns —
 * and crucially cleans up — its global listeners.
 */
export class SpiderHogAbility implements HedgehogSkinAbility {
  private activeWebs = new Map<number, SpiderWebActor>();

  constructor(
    private actor: HedgehogActor,
    private game: HedgehogModeInterface
  ) {
    window.addEventListener("pointerdown", this.onPointerDown);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (this.actor.options.skin !== "spiderhog" || this.actor.isDead) {
      return;
    }

    const web = SpiderWebActor.spawn(this.game, this.actor, {
      x: e.clientX,
      y: e.clientY,
    });
    if (!web) {
      return;
    }

    this.activeWebs.set(e.pointerId, web);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
  };

  private onPointerMove = (e: PointerEvent): void => {
    this.activeWebs.get(e.pointerId)?.moveAnchor({
      x: e.clientX,
      y: e.clientY,
    });
  };

  private onPointerUp = (e: PointerEvent): void => {
    const web = this.activeWebs.get(e.pointerId);
    if (!web) {
      return;
    }
    web.release();
    this.activeWebs.delete(e.pointerId);

    if (this.activeWebs.size === 0) {
      window.removeEventListener("pointermove", this.onPointerMove);
      window.removeEventListener("pointerup", this.onPointerUp);
      window.removeEventListener("pointercancel", this.onPointerUp);
    }
  };

  destroy(): void {
    window.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.activeWebs.forEach((web) => web.release());
    this.activeWebs.clear();
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
