import { describe, expect, it } from "vitest";

import {
  Cone,
  coneHitsRect,
  conePoint,
  ignitionSide,
  Rect,
  rectsTouch,
} from "../src/misc/geometry";

const cone: Cone = {
  origin: { x: 100, y: 200 },
  direction: 1,
  length: 260,
  halfAngleRad: 0.2,
};

describe("coneHitsRect", () => {
  it("hits a rect centred inside the cone", () => {
    const rect: Rect = { x: 180, y: 190, width: 60, height: 20 };
    expect(coneHitsRect(cone, rect)).toBe(true);
  });

  it("misses a rect fully behind the origin", () => {
    const rect: Rect = { x: 20, y: 190, width: 60, height: 20 };
    expect(coneHitsRect(cone, rect)).toBe(false);
  });

  it("misses a rect fully past the cone length", () => {
    const rect: Rect = { x: 400, y: 190, width: 60, height: 20 };
    expect(coneHitsRect(cone, rect)).toBe(false);
  });

  it("misses a rect in front but outside the half angle", () => {
    const rect: Rect = { x: 180, y: 100, width: 60, height: 20 };
    expect(coneHitsRect(cone, rect)).toBe(false);
  });

  it("hits a mirrored rect when facing left", () => {
    const leftCone: Cone = { ...cone, direction: -1 };
    const rect: Rect = { x: 0, y: 190, width: 60, height: 20 };
    expect(coneHitsRect(leftCone, rect)).toBe(true);
  });

  it("hits a rect taller than the cone that straddles the centre ray", () => {
    const rect: Rect = { x: 150, y: 0, width: 80, height: 400 };
    expect(coneHitsRect(cone, rect)).toBe(true);
  });

  it("hits when the origin sits inside the rect", () => {
    const rect: Rect = { x: 90, y: 190, width: 40, height: 40 };
    expect(coneHitsRect(cone, rect)).toBe(true);
  });

  it("hits a rect fully inside the cone", () => {
    const rect: Rect = { x: 120, y: 196, width: 20, height: 8 };
    expect(coneHitsRect(cone, rect)).toBe(true);
  });
});

describe("rectsTouch", () => {
  const a: Rect = { x: 0, y: 0, width: 50, height: 20 };
  const b: Rect = { x: 60, y: 0, width: 50, height: 20 };

  it("touches when the gap is smaller than the padding", () => {
    expect(rectsTouch(a, b, 12)).toBe(true);
  });

  it("does not touch when the gap is larger than the padding", () => {
    expect(rectsTouch(a, b, 8)).toBe(false);
  });

  it("touches overlapping rects with zero padding", () => {
    const overlap: Rect = { x: 40, y: 0, width: 50, height: 20 };
    expect(rectsTouch(a, overlap, 0)).toBe(true);
  });
});

describe("ignitionSide", () => {
  const rect: Rect = { x: 200, y: 100, width: 100, height: 60 };

  it("returns the edge closest to the origin", () => {
    expect(ignitionSide({ x: 100, y: 130 }, rect)).toBe("left");
    expect(ignitionSide({ x: 400, y: 130 }, rect)).toBe("right");
    expect(ignitionSide({ x: 250, y: 20 }, rect)).toBe("top");
    expect(ignitionSide({ x: 250, y: 400 }, rect)).toBe("bottom");
  });
});

describe("conePoint", () => {
  it("returns the origin at distance 0", () => {
    expect(conePoint(cone, 0, 0)).toEqual({ x: 100, y: 200 });
  });

  it("travels along the direction", () => {
    const point = conePoint(cone, 100, 0);
    expect(point.x).toBeCloseTo(200);
    expect(point.y).toBeCloseTo(200);

    const left = conePoint({ ...cone, direction: -1 }, 100, 0);
    expect(left.x).toBeCloseTo(0);
  });

  it("applies the angle offset", () => {
    const up = conePoint(cone, 100, -cone.halfAngleRad);
    expect(up.y).toBeLessThan(200);
  });
});
