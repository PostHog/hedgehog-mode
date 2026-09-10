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

const BURN_DURATION_S = 3;
const SPIN_ROTATIONS = 2;
const SPARKS_PER_SECOND = 20;
const SPARK_SPEED = 8;

const makeActor = () => ({
  forceAngle: 0,
  rigidBody: { position: { x: 100, y: 200 } },
  sprite: { width: 60 },
});

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
    expect(actor.forceAngle).toBe(0);
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

  it("throws sparks outward from the hog", () => {
    ability.fire();
    // 0.0625 of the burn puts the tween angle at pi/4 (SPIN_ROTATIONS turns is
    // 4pi total), where both cos and sin are meaningfully non-zero. Sampling
    // at 0.5 lands exactly on a multiple of 2pi, where sin collapses to ~0 and
    // the radial direction degenerates to the x-axis alone.
    advance(0.0625);

    const [, position, velocity] = spawnFireball.mock.calls[0];
    // Muzzle sits off the body centre, on the rim.
    expect(position.x).not.toBe(100);

    const ox = position.x - 100;
    const oy = position.y - 200;
    // Velocity is collinear with the muzzle offset (2D cross product ~ 0)...
    expect(ox * velocity.y - oy * velocity.x).toBeCloseTo(0);
    // ...and points the same way as the offset, not back at the hog (dot > 0).
    expect(ox * velocity.x + oy * velocity.y).toBeGreaterThan(0);
    // Speed sits within the jitter band around SPARK_SPEED, not just "> 0".
    const speed = Math.hypot(velocity.x, velocity.y);
    expect(speed).toBeGreaterThan(SPARK_SPEED * 0.75);
    expect(speed).toBeLessThan(SPARK_SPEED * 1.25);

    // The heading sweeps as the burn progresses (spec: spark velocity angle
    // advances monotonically and covers SPIN_ROTATIONS turns across the burn).
    const headingBefore = Math.atan2(velocity.y, velocity.x);
    spawnFireball.mockClear();
    advance(0.1875); // a further pi/4 -> 3pi/4 turns the heading by 90 degrees.
    const [, , laterVelocity] = spawnFireball.mock.calls[0];
    const headingAfter = Math.atan2(laterVelocity.y, laterVelocity.x);
    expect(headingAfter).not.toBeCloseTo(headingBefore);
  });

  it("spins the hog and puts it back upright when the burn ends", () => {
    ability.fire();
    // The tween is what actually drives the spin: two full rotations over the
    // whole burn, not e.g. a longer/shorter or differently-scaled animation.
    expect(tweens[0].vars.duration).toBe(BURN_DURATION_S);
    expect(tweens[0].vars.angle).toBeCloseTo(SPIN_ROTATIONS * Math.PI * 2);

    advance(0.5);
    expect(actor.forceAngle).toBeGreaterThan(0);

    advance(1, true);
    expect(actor.forceAngle).toBe(0);
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
    // otherwise it keeps writing forceAngle (and eventually fires onComplete)
    // on an ability that's already torn down.
    expect(killTweensOf).toHaveBeenCalledWith(ability);

    vi.advanceTimersByTime(5000);

    expect(spawnFireball).toHaveBeenCalledTimes(after);
    expect(actor.forceAngle).toBe(0);
    expect(() => ability.destroy()).not.toThrow();
  });
});
