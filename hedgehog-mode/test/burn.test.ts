import { describe, expect, it } from "vitest";

import {
  BURN_FRONTIER_VERTS,
  burnClipPath,
  burnFrontier,
  charFilter,
  hash01,
} from "../src/misc/burn";

function polygonArea(path: string): number {
  const numbers = path
    .slice("polygon(".length, -1)
    .split(",")
    .flatMap((pair) => pair.trim().split(" "))
    .map((token) => parseFloat(token.replace("%", "")));

  const points: [number, number][] = [];
  for (let i = 0; i < numbers.length; i += 2) {
    points.push([numbers[i], numbers[i + 1]]);
  }

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

describe("hash01", () => {
  it("is deterministic and in [0, 1)", () => {
    expect(hash01(123, 4)).toBe(hash01(123, 4));
    for (let i = 0; i < 50; i++) {
      const value = hash01(987.5, i);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("burnClipPath", () => {
  it("covers the full box at progress 0", () => {
    const path = burnClipPath({ side: "left", progress: 0, seed: 42 });
    expect(path.startsWith("polygon(")).toBe(true);
    expect(polygonArea(path)).toBeGreaterThan(9400);
  });

  it("covers (almost) nothing at progress 1", () => {
    const path = burnClipPath({ side: "left", progress: 1, seed: 42 });
    expect(polygonArea(path)).toBeLessThan(100);
  });

  it("is identical for the same frontier", () => {
    const frontier = { side: "left" as const, progress: 0.5, seed: 7 };
    expect(burnClipPath(frontier)).toBe(burnClipPath(frontier));
  });

  it("is jagged halfway through", () => {
    const path = burnClipPath({ side: "left", progress: 0.5, seed: 3 });
    const numbers = path
      .slice("polygon(".length, -1)
      .split(",")
      .flatMap((pair) => pair.trim().split(" "))
      .map((token) => parseFloat(token.replace("%", "")));

    // The frontier vertices are the repeated edge (same x twice per vert):
    // distinct x values beyond the box edges must exceed 2.
    const xs = new Set(
      numbers.filter((_, i) => i % 2 === 0).map((x) => x.toFixed(2))
    );
    expect(xs.size).toBeGreaterThan(2);
  });

  it("erodes from the right when the side is right", () => {
    const left = burnClipPath({ side: "left", progress: 0.5, seed: 5 });
    const right = burnClipPath({ side: "right", progress: 0.5, seed: 5 });
    expect(left).not.toBe(right);
  });

  it("erodes vertically for top", () => {
    const top = burnClipPath({ side: "top", progress: 0.5, seed: 5 });
    const left = burnClipPath({ side: "left", progress: 0.5, seed: 5 });
    expect(top).not.toBe(left);
  });
});

describe("burnFrontier", () => {
  const rect = { x: 100, y: 50, width: 200, height: 80 };

  it("returns VERTS points inside the rect", () => {
    const points = burnFrontier({ side: "left", progress: 0.5, seed: 9 }, rect);
    expect(points).toHaveLength(BURN_FRONTIER_VERTS);
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(rect.x);
      expect(point.x).toBeLessThanOrEqual(rect.x + rect.width);
      expect(point.y).toBeGreaterThanOrEqual(rect.y);
      expect(point.y).toBeLessThanOrEqual(rect.y + rect.height);
    }
  });

  it("moves the frontier with progress", () => {
    const early = burnFrontier({ side: "left", progress: 0.2, seed: 9 }, rect);
    const late = burnFrontier({ side: "left", progress: 0.8, seed: 9 }, rect);
    expect(late[0].x).toBeGreaterThan(early[0].x);
  });
});

describe("charFilter", () => {
  it("is none at progress 0", () => {
    expect(charFilter(0)).toBe("none");
  });

  it("darkens and sepias by 0.7", () => {
    const filter = charFilter(0.7);
    expect(filter).toContain("brightness(0.3");
    expect(filter).toContain("sepia(1");
  });

  it("is nearly black at 1", () => {
    const filter = charFilter(1);
    expect(filter).toContain("brightness(0.12");
  });

  it("interpolates between keyframes", () => {
    const filter = charFilter(0.5);
    expect(filter).not.toBe("none");
    expect(filter).toContain("brightness(");
  });
});
