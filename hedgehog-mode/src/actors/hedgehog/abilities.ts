import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import { SpiderWebActor } from "../../items/SpiderWebActor";

/**
 * A skin-specific active behaviour bound to a single hedgehog. The seed of a
 * per-skin behaviour abstraction: today only spiderhog has one, but hogzilla's
 * fireball and ghost's physics could migrate here so the actor stops branching
 * on `options.skin` inline.
 */
export interface HedgehogSkinAbility {
  /** Detach listeners / tear down any owned state. */
  destroy(): void;
}

/** Build the ability for an actor's current skin, if any. */
export function createSkinAbility(
  actor: HedgehogActor,
  game: HedgehogModeInterface
): HedgehogSkinAbility | undefined {
  switch (actor.options.skin) {
    case "spiderhog":
      return new SpiderHogAbility(actor, game);
    default:
      return undefined;
  }
}

/**
 * Spiderhog web-slinging. A pointer down spawns a web pinned at the cursor and
 * attached to the hog; dragging moves the anchor; releasing detaches it. Tracks
 * webs per pointer id so multitouch slings don't clobber each other. Owns —
 * and crucially cleans up — its global listeners.
 */
class SpiderHogAbility implements HedgehogSkinAbility {
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
