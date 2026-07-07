import { describe, expect, it } from "vitest";
import {
  getKnockbackVelocity,
  getPunchDirection,
  isInPunchRange,
  PUNCH_RANGE_X,
  PUNCH_RANGE_Y,
} from "../src/actors/hedgehog/punch";

describe("getPunchDirection", () => {
  it("punches right when the target is to the right", () => {
    expect(getPunchDirection({ x: 100, y: 50 }, { x: 200, y: 50 })).toBe(1);
  });

  it("punches left when the target is to the left", () => {
    expect(getPunchDirection({ x: 100, y: 50 }, { x: 20, y: 50 })).toBe(-1);
  });

  it("punches right when the target is directly on top of us", () => {
    expect(getPunchDirection({ x: 100, y: 50 }, { x: 100, y: 10 })).toBe(1);
  });
});

describe("isInPunchRange", () => {
  const origin = { x: 100, y: 100 };

  it("hits a hedgehog just in front", () => {
    expect(isInPunchRange(origin, 1, { x: 150, y: 100 })).toBe(true);
  });

  it("does not hit a hedgehog behind the punch direction", () => {
    expect(isInPunchRange(origin, 1, { x: 50, y: 100 })).toBe(false);
    expect(isInPunchRange(origin, -1, { x: 150, y: 100 })).toBe(false);
  });

  it("does not hit beyond the horizontal range", () => {
    expect(
      isInPunchRange(origin, 1, { x: 100 + PUNCH_RANGE_X + 1, y: 100 })
    ).toBe(false);
    expect(isInPunchRange(origin, 1, { x: 100 + PUNCH_RANGE_X, y: 100 })).toBe(
      true
    );
  });

  it("does not hit far above or below", () => {
    expect(
      isInPunchRange(origin, 1, { x: 150, y: 100 + PUNCH_RANGE_Y + 1 })
    ).toBe(false);
    expect(
      isInPunchRange(origin, 1, { x: 150, y: 100 - PUNCH_RANGE_Y - 1 })
    ).toBe(false);
    expect(isInPunchRange(origin, 1, { x: 150, y: 100 + PUNCH_RANGE_Y })).toBe(
      true
    );
  });
});

describe("getKnockbackVelocity", () => {
  it("throws the victim away from the puncher, upwards", () => {
    const v = getKnockbackVelocity({ x: 100, y: 100 }, { x: 140, y: 100 });
    expect(v.x).toBeGreaterThan(0);
    expect(v.y).toBeLessThan(0);
  });

  it("throws left when the victim is left of the puncher", () => {
    const v = getKnockbackVelocity({ x: 100, y: 100 }, { x: 60, y: 100 });
    expect(v.x).toBeLessThan(0);
  });
});
