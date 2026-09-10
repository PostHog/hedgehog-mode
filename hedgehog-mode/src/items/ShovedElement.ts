import Matter from "matter-js";
import gsap from "gsap";
import { COLLISIONS } from "../misc/collisions";
import { shoveOffset, ShoveAnchor } from "../misc/transform";
import { HedgehogModeInterface, GameElement, UpdateTicker } from "../types";
import { SyncedPlatform } from "./SyncedPlatform";
import { shuffle } from "../misc/utils";

// Soft cap so an over-enthusiastic earthquake can't put the whole page in the
// air at once.
const MAX_SHOVED = 40;
// How long it tumbles before it gets embarrassed and goes home.
const SETTLE_DELAY_S = 1.6;
const RETURN_DURATION_S = 1.2;
// Elements bigger than this share of the viewport are page scaffolding rather
// than furniture, and watching a whole layout wrapper cartwheel just reads as
// broken.
const MAX_VIEWPORT_SHARE = 0.4;

/**
 * The nearest ancestor that actually scrolls, or null when the page itself is
 * the scroller. An element's layout position moves with whichever of those two
 * it lives in, and plenty of apps (this project's own playground included) put
 * their content in a scrolling panel rather than scrolling the document.
 */
function scrollParentOf(el: HTMLElement): HTMLElement | null {
  let node = el.parentElement;

  while (node) {
    const style = getComputedStyle(node);
    const scrolls = /(auto|scroll|overlay)/.test(
      style.overflowY + style.overflowX
    );

    if (
      scrolls &&
      (node.scrollHeight > node.clientHeight ||
        node.scrollWidth > node.clientWidth)
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

function scrollOffsetOf(node: HTMLElement | null): { x: number; y: number } {
  return node
    ? { x: node.scrollLeft, y: node.scrollTop }
    : { x: window.scrollX, y: window.scrollY };
}

let TOTAL_SHOVED = 0;
// One shove per element at a time; a second hit just adds to the first.
const SHOVED_BY_ELEMENT = new WeakMap<HTMLElement, ShovedElement>();

/**
 * A DOM element the hedgehog has knocked off its perch. Owns a dynamic Matter
 * body, and every frame writes that body's position onto the real element as a
 * CSS transform, so your actual buttons tumble across your actual website.
 *
 * Deliberately transform-only: nothing is added to or removed from the host
 * DOM, so the page never reflows and the element is one style property away
 * from being exactly as it was. It always ends up back where it started —
 * whether it settles on its own, the game is torn down, or the host rips the
 * element out mid-flight.
 */
export class ShovedElement implements GameElement {
  rigidBody: Matter.Body;
  isInteractive = false;
  isFlammable = false;

  private anchor: ShoveAnchor;
  private scroller: HTMLElement | null;
  private offset = { dx: 0, dy: 0, angle: 0 };
  private settling = false;
  private elapsed = 0;
  // Inline styles as we found them, so we can hand the element back untouched.
  private originalStyles: {
    translate: string;
    rotate: string;
    transition: string;
    willChange: string;
  };

  /**
   * Knock `ref` loose with the given impulse. Returns null when the element
   * isn't worth shoving (too big, already airborne, or we're at the cap) so
   * callers can no-op; a second shove on an airborne element tops up its
   * velocity instead of stacking another simulation on top.
   */
  static shove(
    game: HedgehogModeInterface,
    ref: HTMLElement,
    impulse: Matter.Vector,
    spin: number = 0
  ): ShovedElement | null {
    const existing = SHOVED_BY_ELEMENT.get(ref);
    if (existing) {
      existing.addImpulse(impulse, spin);
      return existing;
    }

    if (TOTAL_SHOVED >= MAX_SHOVED) {
      return null;
    }

    const rect = ref.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const viewportArea = window.innerWidth * window.innerHeight;
    if (rect.width * rect.height > viewportArea * MAX_VIEWPORT_SHARE) {
      return null;
    }

    return new ShovedElement(game, ref, rect, impulse, spin);
  }

  /**
   * Knock the page loose all at once. Shuffled before shoving, because taking
   * the first N platforms in element order just tips over whatever happens to
   * live in the top left, and an earthquake should be felt everywhere.
   */
  static earthquake(game: HedgehogModeInterface): void {
    const platforms = game.elements.filter(
      (element) => element instanceof SyncedPlatform
    ) as SyncedPlatform[];

    shuffle(platforms).forEach((platform) => {
      ShovedElement.shove(
        game,
        platform.ref,
        {
          x: (Math.random() - 0.5) * 14,
          y: -6 - Math.random() * 8,
        },
        (Math.random() - 0.5) * 0.4
      );
    });
  }

  private constructor(
    private game: HedgehogModeInterface,
    public ref: HTMLElement,
    rect: DOMRect,
    impulse: Matter.Vector,
    spin: number
  ) {
    this.scroller = scrollParentOf(ref);
    const scroll = scrollOffsetOf(this.scroller);
    this.anchor = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      scrollX: scroll.x,
      scrollY: scroll.y,
    };

    this.originalStyles = {
      translate: ref.style.translate,
      rotate: ref.style.rotate,
      transition: ref.style.transition,
      willChange: ref.style.willChange,
    };
    // Host transitions would fight our movement properties every frame.
    ref.style.transition = "none";
    ref.style.willChange = "translate, rotate";

    this.rigidBody = Matter.Bodies.rectangle(
      this.anchor.x,
      this.anchor.y,
      rect.width,
      rect.height,
      {
        friction: 0.4,
        frictionAir: 0.015,
        restitution: 0.35,
        label: "ShovedElement",
        // Falls to the floor, but passes through the hedgehog and through the
        // platforms it used to be one of. Being crushed by your own navbar is
        // funnier in theory than it is to debug.
        collisionFilter: {
          category: COLLISIONS.PROJECTILE,
          mask: COLLISIONS.GROUND,
        },
      }
    );

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
    this.addImpulse(impulse, spin);

    this.game.elements.push(this);
    TOTAL_SHOVED++;
    SHOVED_BY_ELEMENT.set(ref, this);
  }

  private addImpulse(impulse: Matter.Vector, spin: number): void {
    if (this.settling) {
      return;
    }
    Matter.Body.setVelocity(this.rigidBody, {
      x: this.rigidBody.velocity.x + impulse.x,
      y: this.rigidBody.velocity.y + impulse.y,
    });
    Matter.Body.setAngularVelocity(
      this.rigidBody,
      this.rigidBody.angularVelocity + spin
    );
  }

  private applyTransform(): void {
    // Individual transform properties compose with the host's `transform`.
    this.ref.style.translate = `${this.offset.dx.toFixed(2)}px ${this.offset.dy.toFixed(2)}px`;
    this.ref.style.rotate = `${this.offset.angle.toFixed(4)}rad`;
  }

  update(ticker: UpdateTicker): void {
    // The host page can re-render an element out from under us at any moment.
    if (!this.ref.isConnected) {
      this.game.removeElement(this);
      return;
    }

    if (this.settling) {
      // gsap owns the offset while it springs home.
      this.applyTransform();
      return;
    }

    const { dx, dy } = shoveOffset(
      this.anchor,
      this.rigidBody.position,
      scrollOffsetOf(this.scroller)
    );
    this.offset.dx = dx;
    this.offset.dy = dy;
    this.offset.angle = this.rigidBody.angle;
    this.applyTransform();

    this.elapsed += ticker.deltaTime;
    if (this.elapsed >= SETTLE_DELAY_S) {
      this.settle();
    }
  }

  /** Spring back into place, then take ourselves out of the game. */
  private settle(): void {
    this.settling = true;
    gsap.to(this.offset, {
      dx: 0,
      dy: 0,
      angle: 0,
      duration: RETURN_DURATION_S,
      ease: "elastic.out(1, 0.5)",
      onComplete: () => this.game.removeElement(this),
    });
  }

  beforeUnload(): void {
    // However we got here, the page gets its element back exactly as it was.
    this.ref.style.translate = this.originalStyles.translate;
    this.ref.style.rotate = this.originalStyles.rotate;
    this.ref.style.transition = this.originalStyles.transition;
    this.ref.style.willChange = this.originalStyles.willChange;
    SHOVED_BY_ELEMENT.delete(this.ref);
    TOTAL_SHOVED--;
  }
}
