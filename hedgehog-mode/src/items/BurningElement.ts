// BurningElement is the burn itself: one page element caught by the
// flamethrower. It copies the ShovedElement contract — save the inline
// styles you touch, write them per frame, restore them exactly in
// beforeUnload() — so the page always gets its element back, however the
// burn ends (burn-out, game teardown, or the host removing the element).
//
// It owns Pixi objects on the worldFx.fx layer: flame tongues along the
// ignition edge that ride the burn line inward, and an additive glow line
// drawn exactly on the frontier. It writes only `filter` and `clip-path`
// to the DOM — ShovedElement writes `translate`/`rotate` — so the two
// compose when the char falls.

import gsap from "gsap";
import { AnimatedSprite, Graphics } from "pixi.js";
import { GameElement, HedgehogModeInterface, UpdateTicker } from "../types";
import { burnClipPath, burnFrontier, charFilter } from "../misc/burn";
import { ignitionSide, Rect, rectsTouch, Side } from "../misc/geometry";
import { hash01 } from "../misc/burn";
import { scrollParentOf, ShovedElement } from "./ShovedElement";
import { SyncedPlatform } from "./SyncedPlatform";

export const MAX_BURNING = 14;
export const BURN_DURATION_S = 3.6;

const COLLAPSE_AT = 0.7;
// How far the clip erodes at collapse: a visible sliver of char falls.
const COLLAPSE_CLIP = 0.82;
const SPREAD_INTERVAL_S = 0.5;
const SPREAD_CHANCE = 0.35;
const SPREAD_PADDING_PX = 12;
const HEAL_DURATION_S = 0.8;
const EMBER_INTERVAL_S = 0.15;
const SMOKE_INTERVAL_S = 0.3;
const SCORCH_INTERVAL_S = 0.6;
const TONGUE_COUNT = 6;

let TOTAL_BURNING = 0;
const BURNING_BY_ELEMENT = new WeakMap<HTMLElement, BurningElement>();

export class BurningElement implements GameElement {
  isInteractive = false;
  isFlammable = false;

  private progress = 0;
  private seed: number;
  private collapsed = false;
  private healing = false;
  private healProgress = 0;
  private elapsed = 0;
  private nextSpread = SPREAD_INTERVAL_S;
  private nextEmber = 0;
  private nextSmoke = 0;
  private nextScorch = 0;
  private tongues: AnimatedSprite[] = [];
  private glow = new Graphics();
  private scroller: HTMLElement | null;

  private originalStyles: {
    clipPath: string;
    filter: string;
    transition: string;
    willChange: string;
  };

  /**
   * Start burning `ref` from `side`. Returns null when the element isn't
   * worth burning (capped, too big, focused, opted out, already airborne);
   * returns the existing burn when it's already alight.
   */
  static ignite(
    game: HedgehogModeInterface,
    ref: HTMLElement,
    side: Side
  ): BurningElement | null {
    const existing = BURNING_BY_ELEMENT.get(ref);
    if (existing) {
      return existing;
    }

    if (TOTAL_BURNING >= MAX_BURNING) {
      return null;
    }

    const rect = ref.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const viewportArea = window.innerWidth * window.innerHeight;
    if (rect.width * rect.height > viewportArea * 0.4) {
      return null;
    }

    // Never burn the field the user is typing in.
    if (document.activeElement && ref.contains(document.activeElement)) {
      return null;
    }

    // Host opt-out hook.
    if (ref.closest("[data-hedgehog-no-burn]")) {
      return null;
    }

    // Already tumbling through the air is excitement enough.
    if (ShovedElement.isShoved(ref)) {
      return null;
    }

    return new BurningElement(game, ref, rect, side);
  }

  static isBurning(ref: HTMLElement): boolean {
    return BURNING_BY_ELEMENT.has(ref);
  }

  private constructor(
    private game: HedgehogModeInterface,
    public ref: HTMLElement,
    rect: Rect,
    private side: Side
  ) {
    this.seed = Math.random() * 1e6;
    this.scroller = scrollParentOf(ref);

    this.originalStyles = {
      clipPath: ref.style.clipPath,
      filter: ref.style.filter,
      transition: ref.style.transition,
      willChange: ref.style.willChange,
    };
    // Host transitions would fight our per-frame writes.
    ref.style.transition = "none";
    ref.style.willChange = "clip-path, filter";

    // Flame tongues along the ignition edge, on the game layer.
    const frames =
      this.game.spritesManager.getAnimatedSpriteFrames("overlays/fire/tile");
    for (let i = 0; i < TONGUE_COUNT; i++) {
      const tongue = new AnimatedSprite(frames);
      tongue.anchor.set(0.5, 1);
      tongue.blendMode = "add";
      tongue.alpha = 0;
      tongue.animationSpeed = 0.3 + Math.random() * 0.2;
      tongue.gotoAndPlay(Math.floor(hash01(this.seed, i) * 14));
      tongue.scale.set(0.5 + hash01(this.seed, i + 100) * 0.4);
      this.game.worldFx.fx.addChild(tongue);
      this.tongues.push(tongue);
      gsap.to(tongue, { alpha: 0.85, duration: 0.4, ease: "power1.out" });
    }
    this.game.worldFx.fx.addChild(this.glow);

    this.game.elements.push(this);
    BURNING_BY_ELEMENT.set(ref, this);
    TOTAL_BURNING++;
  }

  update(ticker: UpdateTicker): void {
    // The host page can re-render an element out from under us at any moment.
    if (!this.ref.isConnected) {
      this.game.removeElement(this);
      return;
    }

    const dt = ticker.deltaTime;
    this.elapsed += dt;

    if (this.healing) {
      this.healProgress = Math.min(1, this.healProgress + dt / HEAL_DURATION_S);
      this.applyStyles(
        1 - this.healProgress,
        COLLAPSE_CLIP * (1 - this.healProgress)
      );
      if (this.healProgress >= 1) {
        this.game.removeElement(this);
      }
      return;
    }

    this.progress = Math.min(1, this.progress + dt / BURN_DURATION_S);
    const clipProgress =
      Math.min(this.progress / COLLAPSE_AT, 1) * COLLAPSE_CLIP;
    this.applyStyles(this.progress, clipProgress);

    const rect = this.ref.getBoundingClientRect();
    this.updateTongues(rect, clipProgress);
    this.updateGlow(rect, clipProgress);

    // Emitters.
    if (this.elapsed >= this.nextEmber) {
      this.nextEmber = this.elapsed + EMBER_INTERVAL_S;
      this.game.worldFx.emberField.emitEmbers(
        this.frontierPoint(rect, clipProgress),
        2
      );
    }
    if (this.elapsed >= this.nextSmoke) {
      this.nextSmoke = this.elapsed + SMOKE_INTERVAL_S;
      this.game.worldFx.emberField.emitSmoke(
        this.frontierPoint(rect, clipProgress),
        1
      );
    }
    if (this.elapsed >= this.nextScorch) {
      this.nextScorch = this.elapsed + SCORCH_INTERVAL_S;
      this.game.worldFx.scorchLayer.mark(rect, this.side, this.progress);
    }

    // Spread to touching platforms.
    if (!this.collapsed && this.elapsed >= this.nextSpread) {
      this.nextSpread = this.elapsed + SPREAD_INTERVAL_S;
      this.spread(rect);
    }

    // Collapse: hand the charred sliver to gravity.
    if (!this.collapsed && this.progress >= COLLAPSE_AT) {
      this.collapsed = true;
      const direction = this.side === "left" ? -1 : 1;
      ShovedElement.shove(
        this.game,
        this.ref,
        { x: direction * 1.5, y: -3 },
        direction * 0.15
      );
      // Burst from the burn frontier, not the centre: getBoundingClientRect
      // is live and our own clip-path has already eroded the box.
      const burst = this.frontierPoint(rect, clipProgress);
      this.game.worldFx.emberField.emitEmbers(burst, 20);
      this.game.worldFx.emberField.emitSmoke(burst, 4);
      for (const tongue of this.tongues) {
        gsap.to(tongue, { alpha: 0, duration: 0.4, ease: "power1.in" });
      }
    }

    if (this.progress >= 1) {
      this.healing = true;
    }
  }

  private applyStyles(charProgress: number, clipProgress: number): void {
    this.ref.style.filter = charFilter(charProgress);
    this.ref.style.clipPath =
      clipProgress <= 0
        ? "none"
        : burnClipPath({
            side: this.side,
            progress: clipProgress,
            seed: this.seed,
          });
  }

  private frontierPoints(rect: Rect, clipProgress: number) {
    return burnFrontier(
      { side: this.side, progress: clipProgress, seed: this.seed },
      rect
    );
  }

  private frontierPoint(rect: Rect, clipProgress: number) {
    const points = this.frontierPoints(rect, clipProgress);
    return points[Math.floor(Math.random() * points.length)];
  }

  private updateTongues(rect: Rect, clipProgress: number): void {
    const points = this.frontierPoints(rect, clipProgress);
    const lean =
      this.side === "left" ? 0.35 : this.side === "right" ? -0.35 : 0;
    this.tongues.forEach((tongue, i) => {
      const point =
        points[Math.floor((i / this.tongues.length) * points.length)];
      tongue.position.set(point.x, point.y);
      tongue.rotation = lean;
    });
  }

  private updateGlow(rect: Rect, clipProgress: number): void {
    const points = this.frontierPoints(rect, clipProgress);
    const alpha = 0.6 + 0.3 * Math.sin(this.elapsed * 30);
    this.glow.clear();
    this.glow
      .poly(points.flatMap((p) => [p.x, p.y]))
      .stroke({ width: 3, color: 0xff7a1a, alpha });
  }

  private spread(rect: Rect): void {
    for (const element of this.game.elements) {
      if (!(element instanceof SyncedPlatform) || element.ref === this.ref) {
        continue;
      }
      if (BurningElement.isBurning(element.ref)) {
        continue;
      }
      const otherRect = element.lastRect ?? element.ref.getBoundingClientRect();
      if (!rectsTouch(rect, otherRect, SPREAD_PADDING_PX)) {
        continue;
      }
      if (Math.random() >= SPREAD_CHANCE) {
        continue;
      }
      const centre = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
      BurningElement.ignite(
        this.game,
        element.ref,
        ignitionSide(centre, otherRect)
      );
    }
  }

  beforeUnload(): void {
    gsap.killTweensOf(this.tongues);
    // However we got here, the page gets its element back exactly as it was.
    this.ref.style.clipPath = this.originalStyles.clipPath;
    this.ref.style.filter = this.originalStyles.filter;
    this.ref.style.transition = this.originalStyles.transition;
    this.ref.style.willChange = this.originalStyles.willChange;

    for (const tongue of this.tongues) {
      this.game.worldFx.fx.removeChild(tongue);
      tongue.destroy();
    }
    this.game.worldFx.fx.removeChild(this.glow);
    this.glow.destroy();

    BURNING_BY_ELEMENT.delete(this.ref);
    TOTAL_BURNING--;
  }
}
