import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

// vi.mock factories are hoisted above imports, so shared mock state referenced
// inside them must be declared via vi.hoisted() rather than plain module-scope
// `const` bindings — otherwise the factories close over bindings that are
// still in their temporal dead zone at hoist time.
const { tweens, spawnFireball, killTweensOf } = vi.hoisted(() => ({
  tweens: [] as Array<Record<string, any>>,
  spawnFireball:
    vi.fn<
      (
        game: unknown,
        position: { x: number; y: number },
        velocity: { x: number; y: number }
      ) => void
    >(),
  killTweensOf: vi.fn<(target: unknown) => void>(),
}));

vi.mock("gsap", () => ({
  default: {
    to: (target: unknown, vars: Record<string, any>) => {
      tweens.push({ target, vars });
      return { kill: () => {} };
    },
    killTweensOf: (...args: unknown[]) => killTweensOf(...args),
  },
}));

vi.mock("../src/items/Flame", () => ({
  FlameActor: {
    spawnFireball: (...args: unknown[]) => spawnFireball(...args),
  },
}));

import { CatherineWheelAbility } from "../src/actors/hedgehog/abilities";

const BURN_DURATION_S = 5;
const SPIN_ROTATIONS = 4;
const SPARKS_PER_SECOND = 20;
const SPARK_SPEED = 11;

const HUB = { x: 100, y: 200 };

const makeWheel = () => ({
  rotation: 0,
  // The wheel is anchored on its own centre, so its global position is the hub
  // the sparks orbit. Fixed here; the real one rides the hog.
  getGlobalPosition: () => ({ ...HUB }),
});

const makeActor = () => ({
  forceAngle: 0,
  rigidBody: { position: { x: 100, y: 200 } },
  sprite: { width: 60, scale: { x: 1, y: 1 } },
  accessorySprites: { "catherine-wheel": makeWheel() } as Record<
    string,
    ReturnType<typeof makeWheel>
  >,
});

const wheelOf = (actor: ReturnType<typeof makeActor>) =>
  actor.accessorySprites["catherine-wheel"];

// Runs the burn the way gsap would: drive the recorded tween to `progress` (an
// absolute point in the burn, 0 -> 1) and tick it, then optionally complete it.
// The tween is the ability's only clock — sparks included — so nothing here
// touches the wall clock.
const advance = (progress: number, complete = false) => {
  const tween = tweens[tweens.length - 1];
  tween.target.angle = tween.vars.angle * progress;
  tween.vars.onUpdate?.();
  if (complete) {
    tween.vars.onComplete?.();
  }
};

describe("CatherineWheelAbility", () => {
  let actor: ReturnType<typeof makeActor>;
  let ability: CatherineWheelAbility;

  beforeEach(() => {
    vi.useFakeTimers();
    tweens.length = 0;
    spawnFireball.mockClear();
    killTweensOf.mockClear();
    actor = makeActor();
    ability = new CatherineWheelAbility(actor as never, {} as never);
  });

  afterEach(() => {
    ability.destroy();
    vi.useRealTimers();
  });

  it("does nothing until it is fired", () => {
    expect(spawnFireball).not.toHaveBeenCalled();
    expect(wheelOf(actor).rotation).toBe(0);
  });

  it("emits a spark for every tick of the burn", () => {
    // Driven frame by frame, as the engine drives it, rather than in one jump:
    // the sparks have to come out steadily across the burn and the total must
    // not drift over the ~180 updates a 3 second burn gets at 60fps.
    const FRAMES = BURN_DURATION_S * 60;
    ability.fire();

    for (let frame = 1; frame <= FRAMES / 2; frame++) {
      advance(frame / FRAMES);
    }
    expect(spawnFireball).toHaveBeenCalledTimes(
      (BURN_DURATION_S * SPARKS_PER_SECOND) / 2
    );

    for (let frame = FRAMES / 2 + 1; frame <= FRAMES; frame++) {
      advance(frame / FRAMES, frame === FRAMES);
    }
    expect(spawnFireball).toHaveBeenCalledTimes(
      BURN_DURATION_S * SPARKS_PER_SECOND
    );
  });

  it("throws sparks outward from the wheel's hub", () => {
    ability.fire();
    // 0.03125 of the burn puts the tween angle at pi/4 (SPIN_ROTATIONS turns is
    // 8pi total), where both cos and sin are meaningfully non-zero. Sampling
    // at 0.5 lands exactly on a multiple of 2pi, where sin collapses to ~0 and
    // the radial direction degenerates to the x-axis alone.
    advance(0.03125);

    const [, position, velocity] = spawnFireball.mock.calls[0];
    // Muzzle sits off the hub, on the rim.
    expect(position.x).not.toBe(HUB.x);

    const ox = position.x - HUB.x;
    const oy = position.y - HUB.y;
    // Velocity is collinear with the muzzle offset (2D cross product ~ 0)...
    expect(ox * velocity.y - oy * velocity.x).toBeCloseTo(0);
    // ...and points the same way as the offset, not back at the hub (dot > 0).
    expect(ox * velocity.x + oy * velocity.y).toBeGreaterThan(0);
    // Speed sits within the jitter band around SPARK_SPEED, not just "> 0".
    const speed = Math.hypot(velocity.x, velocity.y);
    expect(speed).toBeGreaterThan(SPARK_SPEED * 0.75);
    expect(speed).toBeLessThan(SPARK_SPEED * 1.25);

    // The heading sweeps as the burn progresses (spec: spark velocity angle
    // advances monotonically and covers SPIN_ROTATIONS turns across the burn).
    const headingBefore = Math.atan2(velocity.y, velocity.x);
    spawnFireball.mockClear();
    advance(0.09375); // a further pi/2 -> 3pi/4 turns the heading by 90 degrees.
    const [, , laterVelocity] = spawnFireball.mock.calls[0];
    const headingAfter = Math.atan2(laterVelocity.y, laterVelocity.x);
    expect(headingAfter).not.toBeCloseTo(headingBefore);
  });

  it("spins the wheel and leaves it still when the burn ends", () => {
    ability.fire();
    // The tween is what actually drives the spin: two full rotations over the
    // whole burn, not e.g. a longer/shorter or differently-scaled animation.
    expect(tweens[0].vars.duration).toBe(BURN_DURATION_S);
    expect(tweens[0].vars.angle).toBeCloseTo(SPIN_ROTATIONS * Math.PI * 2);

    advance(0.5);
    expect(wheelOf(actor).rotation).toBeGreaterThan(0);

    advance(1, true);
    expect(wheelOf(actor).rotation).toBe(0);
  });

  it("never turns the hog himself", () => {
    // The whole point of the rework. Rotating the actor turned his sprite and
    // his hitbox with it, which read as a broken render rather than a firework,
    // so the spin has to stay on the accessory for the entire burn.
    ability.fire();

    for (let frame = 1; frame <= 60; frame++) {
      advance(frame / 60, frame === 60);
      expect(actor.forceAngle).toBe(0);
    }
  });

  it("spins whichever wheel the hog is wearing right now", () => {
    // updateOptions() rebuilds accessorySprites wholesale, so a colour change
    // mid-burn swaps the sprite out from under the ability. Holding a reference
    // from fire() would leave it spinning a sprite that is no longer on screen.
    ability.fire();
    advance(0.25);

    const replacement = makeWheel();
    actor.accessorySprites["catherine-wheel"] = replacement;
    advance(0.5);

    expect(replacement.rotation).toBeGreaterThan(0);
  });

  it("survives the wheel being taken off mid-burn", () => {
    ability.fire();
    advance(0.25);
    const emitted = spawnFireball.mock.calls.length;

    delete actor.accessorySprites["catherine-wheel"];

    expect(() => advance(1, true)).not.toThrow();
    // Sparks come off the rim, so no wheel means no sparks.
    expect(spawnFireball).toHaveBeenCalledTimes(emitted);
  });

  it("mirrors the sparks when the hog faces left", () => {
    // The hog's sprite flips on scale.x and the wheel flips with it, so the
    // visible spin runs the other way. Sparks have to follow the picture.
    ability.fire();
    advance(0.03125);
    const [, , facingRight] = spawnFireball.mock.calls[0];

    spawnFireball.mockClear();
    actor.sprite.scale.x = -1;
    ability.destroy();
    ability = new CatherineWheelAbility(actor as never, {} as never);
    ability.fire();
    advance(0.03125);
    const [, , facingLeft] = spawnFireball.mock.calls[0];

    // Mirrored about the vertical axis: x flips sign, y is untouched.
    expect(Math.sign(facingLeft.x)).toBe(-Math.sign(facingRight.x));
    expect(Math.sign(facingLeft.y)).toBe(Math.sign(facingRight.y));
  });

  it("ignores the repeat fire from a held key", () => {
    // controls.ts calls maybeSpawnFireball() every 100ms while `f` is down.
    // Re-fire mid-burn (not just at t=0, where the angle is still trivially
    // zero) must still be a no-op.
    ability.fire();
    advance(0.25);
    ability.fire();
    advance(1, true);

    expect(tweens).toHaveLength(1);
    expect(spawnFireball).toHaveBeenCalledTimes(
      BURN_DURATION_S * SPARKS_PER_SECOND
    );
  });

  it("can be lit again once it has burned out", () => {
    ability.fire();
    advance(1, true);
    spawnFireball.mockClear();

    ability.fire();
    advance(1, true);

    expect(spawnFireball).toHaveBeenCalledTimes(
      BURN_DURATION_S * SPARKS_PER_SECOND
    );
  });

  it("emits nothing while the game is not driving it", () => {
    // HedgeHogMode.destroy() stops the Matter runner and destroys the Pixi app
    // without calling beforeUnload() on live elements, so a burning wheel is
    // never torn down — the tween simply stops being ticked. Sparks must ride
    // that same clock, or they spawn into a destroyed stage forever. This is
    // also why `slow`/`fast` scale the burn: the tween is the only timebase.
    ability.fire();
    advance(0.5);
    const emitted = spawnFireball.mock.calls.length;
    expect(emitted).toBeGreaterThan(0);

    // No destroy(), no extinguish — just a clock that stopped ticking.
    vi.advanceTimersByTime(10 * BURN_DURATION_S * 1000);

    expect(spawnFireball).toHaveBeenCalledTimes(emitted);
  });

  it("stops cleanly and can be destroyed twice", () => {
    ability.fire();
    advance(0.5);
    ability.destroy();
    const after = spawnFireball.mock.calls.length;

    // The gsap tween must actually be killed, not just locally forgotten —
    // otherwise it keeps spinning the wheel (and eventually fires onComplete)
    // on an ability that's already torn down.
    expect(killTweensOf).toHaveBeenCalledWith(ability);

    vi.advanceTimersByTime(5000);

    expect(spawnFireball).toHaveBeenCalledTimes(after);
    expect(wheelOf(actor).rotation).toBe(0);
    expect(() => ability.destroy()).not.toThrow();
  });
});
