import Matter, { Bodies, Composite, Constraint } from "matter-js";
import { Graphics } from "pixi.js";
import gsap from "gsap";
import { HedgehogModeInterface, GameElement, UpdateTicker } from "../types";
import type { HedgehogActor } from "../actors/Hedgehog";

const NUM_LINKS = 8;
// How long the strand stays fully visible after release before it fades.
const FADE_DELAY_S = 2;
const FADE_DURATION_S = 1.5;
// Soft cap so spamming clicks can't flood the world with rope bodies.
const MAX_WEBS = 40;

// Rope feel: springy + damped so the strand flexes instead of snapping rigid.
const ANCHOR_STIFFNESS = 1; // firmly stuck to the point it grabbed
const LINK_STIFFNESS = 0.8;
const LINK_DAMPING = 0.1;
const ATTACH_STIFFNESS = 0.6;
const ATTACH_DAMPING = 0.2;

// The rope is built spanning anchor -> hog, then sized to SLACK_FACTOR of that
// distance so it rests shorter than the span — giving a gentle but real tension
// drawing him in (no violent yank, however far the click). Lower = more pull.
// He then climbs the rope himself with W/S.
const SLACK_FACTOR = 0.8;
// How fast climbing shortens/lengthens the rope (multiplier per second held).
const CLIMB_PER_SECOND = 2.5;
const MIN_LINK_LENGTH = 6;
// Descending can extend the rope well past where it started; this just keeps the
// numbers bounded so a held key can't blow the link lengths up to infinity.
const MAX_LINK_LENGTH_FLOOR = 400;

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
  // The inter-link constraints, whose rest length we shrink/grow to climb.
  private links: Constraint[] = [];
  private initialLinkLength = 0;
  private maxLinkLength = 0;
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
    // No stage means the app isn't initialised yet (or has been torn down) —
    // there's nowhere to render the strand, so don't build one.
    if (!game.app?.stage) {
      return null;
    }
    return new SpiderWebActor(game, actor, point);
  }

  private constructor(
    private game: HedgehogModeInterface,
    private actor: HedgehogActor,
    point: Matter.Vector
  ) {
    // Build the rope spanning anchor -> hog, links evenly spaced along the line.
    // Its rest length is based on the *vertical* drop to the hog, not the full
    // diagonal — so a sideways click yields a rope that's short relative to the
    // span and pulls him over to settle hovering below the anchor, rather than a
    // long slack rope he just dangles from. A click straight up gives a gentle
    // lift (vertical ~= full distance).
    const hog = this.actor.rigidBody!.position;
    const verticalSpan = Math.abs(hog.y - point.y);
    this.initialLinkLength = Math.max(
      MIN_LINK_LENGTH,
      (verticalSpan / (NUM_LINKS - 1)) * SLACK_FACTOR
    );
    // Allow descending well past the starting length, proportional to it.
    this.maxLinkLength = Math.max(
      this.initialLinkLength * 4,
      MAX_LINK_LENGTH_FLOOR
    );

    const bodies: Matter.Body[] = [];
    for (let i = 0; i < NUM_LINKS; i++) {
      const t = i / (NUM_LINKS - 1);
      bodies.push(
        Bodies.rectangle(
          point.x + (hog.x - point.x) * t,
          point.y + (hog.y - point.y) * t,
          5,
          20,
          {
            density: 0.0005,
            frictionAir: 0.02,
            // The strand is decorative — it shouldn't knock actors around.
            collisionFilter: { mask: 0 },
          }
        )
      );
    }

    this.rope = Composite.create();
    Composite.add(this.rope, bodies);
    for (let i = 0; i < bodies.length - 1; i++) {
      const link = Constraint.create({
        bodyA: bodies[i],
        bodyB: bodies[i + 1],
        length: this.initialLinkLength,
        stiffness: LINK_STIFFNESS,
        damping: LINK_DAMPING,
      });
      this.links.push(link);
      Composite.add(this.rope, link);
    }

    const firstLink = bodies[0];
    const lastLink = bodies[bodies.length - 1];

    this.anchor = Constraint.create({
      pointA: { x: point.x, y: point.y },
      bodyB: firstLink,
      length: 0,
      stiffness: ANCHOR_STIFFNESS,
    });

    this.attachment = Constraint.create({
      bodyA: lastLink,
      bodyB: this.actor.rigidBody!,
      length: 10,
      stiffness: ATTACH_STIFFNESS,
      damping: ATTACH_DAMPING,
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

  update(ticker: UpdateTicker): void {
    this.climb(ticker.deltaMS / 1000);
    this.draw();
  }

  // Reel the rope shorter (climb up) or longer (descend) while the hog signals
  // an intent. Shrinking the link rest lengths draws him toward the anchor with
  // building tension; growing them lowers him back down, never past where the
  // web first reached.
  private climb(dtSeconds: number): void {
    if (!this.attachment) {
      return;
    }
    const direction = this.actor.webClimbDirection;
    if (direction === 0) {
      return;
    }
    const step = Math.pow(CLIMB_PER_SECOND, dtSeconds);
    const multiplier = direction > 0 ? 1 / step : step;
    this.links.forEach((link) => {
      link.length = Math.min(
        this.maxLinkLength,
        Math.max(MIN_LINK_LENGTH, link.length * multiplier)
      );
    });
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
