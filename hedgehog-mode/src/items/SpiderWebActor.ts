import Matter, { Bodies, Composite, Composites, Constraint } from "matter-js";
import { Graphics } from "pixi.js";
import gsap from "gsap";
import { HedgehogModeInterface, GameElement } from "../types";
import type { HedgehogActor } from "../actors/Hedgehog";

const NUM_LINKS = 8;
// How long the strand stays fully visible after release before it fades.
const FADE_DELAY_S = 2;
const FADE_DURATION_S = 1.5;
// Soft cap so spamming clicks can't flood the world with rope bodies.
const MAX_WEBS = 40;

// The silk reads white, but a translucent dark outline underneath keeps it
// visible on light backgrounds (the hog overlays arbitrary web pages, so we
// can't assume a dark canvas). Dark edge shows on white; white core shows on
// dark; both show on everything in between.
const SILK_COLOR = 0xffffff;
const OUTLINE_COLOR = 0x1b1b2a;

// Where the strand grips the hog: offset sideways from centre toward the hand
// (a fraction of the sprite width), in the direction it's facing. Same height
// as the body centre.
const HAND_X_FRACTION = 0.25;

let TOTAL_WEBS = 0;

/**
 * A spiderhog web strand. While attached it hangs between a pointer-controlled
 * anchor and the hedgehog, pulling the hog as it swings. On {@link release} it
 * detaches from the hog, pins to the release point, keeps simulating under
 * physics, and fades out before removing itself — so slinging leaves a trail of
 * fading webs behind.
 *
 * Owns its own Matter bodies + Pixi graphics (it has no single rigidBody/sprite
 * for the engine to clean up), so all teardown happens in {@link beforeUnload}.
 */
export class SpiderWebActor implements GameElement {
  isInteractive = false;
  isFlammable = false;

  private rope: Composite;
  private anchor: Constraint;
  // Constraint tying the strand to the hog; dropped on release.
  private attachment?: Constraint;
  private graphics = new Graphics();
  private released = false;
  private fade = 0;

  /**
   * Spawn a web from `actor` pinned at `point`. Returns null if the soft cap is
   * hit so the caller can no-op.
   */
  static spawn(
    game: HedgehogModeInterface,
    actor: HedgehogActor,
    point: Matter.Vector
  ): SpiderWebActor | null {
    if (TOTAL_WEBS >= MAX_WEBS) {
      return null;
    }
    return new SpiderWebActor(game, actor, point);
  }

  private constructor(
    private game: HedgehogModeInterface,
    private actor: HedgehogActor,
    point: Matter.Vector
  ) {
    this.rope = Composites.stack(
      point.x,
      point.y,
      1,
      NUM_LINKS,
      0,
      5,
      (x: number, y: number) =>
        Bodies.rectangle(x, y, 5, 20, {
          density: 0.0005,
          frictionAir: 0.02,
          // The strand is decorative — it shouldn't knock actors around.
          collisionFilter: { mask: 0 },
        })
    );
    Composites.chain(this.rope, 0.5, 0, -0.5, 0, { stiffness: 0.9 });

    const firstLink = this.rope.bodies[0];
    const lastLink = this.rope.bodies[this.rope.bodies.length - 1];

    this.anchor = Constraint.create({
      pointA: { x: point.x, y: point.y },
      bodyB: firstLink,
      length: 0,
      stiffness: 1,
    });

    this.attachment = Constraint.create({
      bodyA: lastLink,
      bodyB: this.actor.rigidBody!,
      length: 10,
      stiffness: 1,
    });

    Matter.World.add(this.game.engine.world, [
      this.rope,
      this.anchor,
      this.attachment,
    ]);
    this.game.app.stage.addChild(this.graphics);
    this.game.elements.push(this);
    this.actor.attachWeb(this);
    TOTAL_WEBS++;
  }

  /** Move the pinned end to follow the pointer (no-op once released). */
  moveAnchor(point: Matter.Vector): void {
    if (this.released) {
      return;
    }
    this.anchor.pointA.x = point.x;
    this.anchor.pointA.y = point.y;
  }

  /** Detach from the hog, freeze at the current anchor point, then fade out. */
  release(): void {
    if (this.released) {
      return;
    }
    this.released = true;

    if (this.attachment) {
      Matter.World.remove(this.game.engine.world, this.attachment);
      this.attachment = undefined;
    }
    this.actor.detachWeb(this);

    gsap.to(this, {
      fade: 1,
      duration: FADE_DURATION_S,
      delay: FADE_DELAY_S,
      ease: "power2.in",
      onComplete: () => this.game.removeElement(this),
    });
  }

  update(): void {
    this.draw();
  }

  // Silk strand: anchor -> rope body centres -> hog (while attached). Drawn as a
  // dark contrast outline under a crisp white line, with a "stuck" splat at the
  // anchor. Two passes (dark wider, white narrower) keep it readable on both
  // light and dark backgrounds.
  private draw(): void {
    const alpha = 1 - this.fade;
    const points: Matter.Vector[] = [
      { x: this.anchor.pointA.x, y: this.anchor.pointA.y },
      ...this.rope.bodies.map((body) => ({
        x: body.position.x,
        y: body.position.y,
      })),
    ];
    if (this.attachment) {
      // Grip the hog at the hand, not the centre. Offset relative to the body
      // (its angle is forced upright, so no rotation needed) keeps the physics
      // constraint and the drawn endpoint in sync.
      const body = this.actor.rigidBody!;
      const direction = this.actor.getDirection() === "left" ? -1 : 1;
      const reach = Math.abs(this.actor.sprite!.width) * HAND_X_FRACTION;
      this.attachment.pointB = { x: direction * reach, y: 0 };
      points.push({ x: body.position.x + direction * reach, y: body.position.y });
    }

    const graphics = this.graphics;
    graphics.clear();

    const traceStrand = () => {
      graphics.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        graphics.lineTo(points[i].x, points[i].y);
      }
    };

    // Dark outline underlay — gives contrast on light backgrounds.
    traceStrand();
    graphics.stroke({
      width: 3.5,
      color: OUTLINE_COLOR,
      alpha: 0.35 * alpha,
      cap: "round",
      join: "round",
    });

    // Crisp silk strand on top.
    traceStrand();
    graphics.stroke({
      width: 1.5,
      color: SILK_COLOR,
      alpha: 0.95 * alpha,
      cap: "round",
      join: "round",
    });

    // Anchor splat where the web sticks — dark halo then white core.
    const a = points[0];
    graphics.circle(a.x, a.y, 4).fill({ color: OUTLINE_COLOR, alpha: 0.3 * alpha });
    graphics.circle(a.x, a.y, 3).fill({ color: SILK_COLOR, alpha: 0.85 * alpha });

    const traceSplatLegs = () => {
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + Math.PI / 4;
        graphics.moveTo(a.x, a.y);
        graphics.lineTo(a.x + Math.cos(angle) * 6, a.y + Math.sin(angle) * 6);
      }
    };

    traceSplatLegs();
    graphics.stroke({ width: 2, color: OUTLINE_COLOR, alpha: 0.3 * alpha, cap: "round" });
    traceSplatLegs();
    graphics.stroke({ width: 1, color: SILK_COLOR, alpha: 0.6 * alpha, cap: "round" });
  }

  beforeUnload(): void {
    Matter.World.remove(this.game.engine.world, this.rope);
    Matter.World.remove(this.game.engine.world, this.anchor);
    if (this.attachment) {
      Matter.World.remove(this.game.engine.world, this.attachment);
      this.attachment = undefined;
    }
    // Safety in case we're torn down while still attached (e.g. game destroy).
    this.actor.detachWeb(this);
    this.graphics.destroy();
    TOTAL_WEBS--;
  }
}
