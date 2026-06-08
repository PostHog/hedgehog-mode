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
