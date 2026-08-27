import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

// vi.mock factories are hoisted above imports, so shared mock state referenced
// inside them must be declared via vi.hoisted() rather than plain module-scope
// `const` bindings — otherwise the factories close over bindings that are
// still in their temporal dead zone at hoist time.
const { tweens, spawnFireball } = vi.hoisted(() => ({
  tweens: [] as Array<Record<string, any>>,
  spawnFireball: vi.fn(),
}));

vi.mock("gsap", () => ({
  default: {
    to: (target: unknown, vars: Record<string, any>) => {
      tweens.push({ target, vars });
      return { kill: () => {} };
    },
    killTweensOf: () => {},
  },
}));

vi.mock("../src/items/Flame", () => ({
  FlameActor: {
    spawnFireball: (...args: unknown[]) => spawnFireball(...args),
  },
}));

import { CatherineWheelAbility } from "../src/actors/hedgehog/abilities";

const BURN_DURATION_S = 3;
const SPARKS_PER_SECOND = 20;

const makeActor = () => ({
  forceAngle: 0,
  rigidBody: { position: { x: 100, y: 200 } },
  sprite: { width: 60 },
});

// Runs the burn the way gsap would: drive the recorded tween to `progress`,
// then optionally complete it.
const advance = (progress: number, complete = false) => {
  const tween = tweens[tweens.length - 1];
  tween.target.angle = tween.vars.angle * progress;
  tween.vars.onUpdate?.();
  vi.advanceTimersByTime(BURN_DURATION_S * 1000 * progress);
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
    ability.fire();
    advance(1, true);

    expect(spawnFireball).toHaveBeenCalledTimes(BURN_DURATION_S * SPARKS_PER_SECOND);
  });

  it("throws sparks outward from the hog", () => {
    ability.fire();
    advance(0.5);

    const [, position, velocity] = spawnFireball.mock.calls[0];
    // Muzzle sits off the body centre, on the rim.
    expect(position.x).not.toBe(100);
    // Velocity points the same way as the offset: radially outward.
    expect(Math.sign(velocity.x)).toBe(Math.sign(position.x - 100));
    expect(Math.hypot(velocity.x, velocity.y)).toBeGreaterThan(0);
  });

  it("spins the hog and puts it back upright when the burn ends", () => {
    ability.fire();
    advance(0.5);
    expect(actor.forceAngle).toBeGreaterThan(0);

    advance(1, true);
    expect(actor.forceAngle).toBe(0);
  });

  it("ignores the repeat fire from a held key", () => {
    // controls.ts calls maybeSpawnFireball() every 100ms while `f` is down.
    ability.fire();
    ability.fire();
    ability.fire();
    advance(1, true);

    expect(tweens).toHaveLength(1);
    expect(spawnFireball).toHaveBeenCalledTimes(BURN_DURATION_S * SPARKS_PER_SECOND);
  });

  it("can be lit again once it has burned out", () => {
    ability.fire();
    advance(1, true);
    spawnFireball.mockClear();

    ability.fire();
    advance(1, true);

    expect(spawnFireball).toHaveBeenCalledTimes(BURN_DURATION_S * SPARKS_PER_SECOND);
  });

  it("stops cleanly and can be destroyed twice", () => {
    ability.fire();
    advance(0.5);
    ability.destroy();
    const after = spawnFireball.mock.calls.length;

    vi.advanceTimersByTime(5000);

    expect(spawnFireball).toHaveBeenCalledTimes(after);
    expect(actor.forceAngle).toBe(0);
    expect(() => ability.destroy()).not.toThrow();
  });
});
