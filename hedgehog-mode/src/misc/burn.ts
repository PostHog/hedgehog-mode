// Pure CSS generators for the burn: a jagged clip-path that erodes a box from
// one edge, the frontier points of that line in pixels (for flames and glow),
// and the char filter ramp. Pure so they can be unit tested without a browser
// and so two frames with the same progress produce identical strings — a
// frontier that jittered every frame would read as a bug, not a fire.

import type { Rect, Side, Vec } from "./geometry";

export const BURN_FRONTIER_VERTS = 24;

export type Frontier = {
  /** The edge the burn started from. */
  side: Side;
  /** 0 = untouched, 1 = fully eroded. */
  progress: number;
  /** Stable noise seed, so the jagged line doesn't jitter between frames. */
  seed: number;
};

/** Deterministic 0..1 hash. Same (seed, i) in, same value out, every frame. */
export function hash01(seed: number, i: number): number {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

/**
 * Frontier vertices along the erosion edge, in normalised 0..1 box space.
 * For left/right sides the erosion travels along x; for top/bottom along y.
 * Each vertex sits at `progress` plus a small stable noise offset.
 */
function frontierPoints(f: Frontier, jaggedness: number): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i < BURN_FRONTIER_VERTS; i++) {
    const t = i / (BURN_FRONTIER_VERTS - 1);
    const noise = (hash01(f.seed, i) - 0.5) * 2 * jaggedness;
    const p = clamp01(f.progress * (1 + jaggedness * 2) + noise);
    switch (f.side) {
      case "left":
        points.push([p, t]);
        break;
      case "right":
        points.push([1 - p, t]);
        break;
      case "top":
        points.push([t, p]);
        break;
      case "bottom":
        points.push([t, 1 - p]);
        break;
    }
  }
  return points;
}

/**
 * CSS polygon() that keeps the un-burnt part of a 0..1 unit box. The frontier
 * is a jagged line at `progress` from `side`. progress 0 → full box,
 * progress 1 → (almost) nothing.
 */
export function burnClipPath(f: Frontier, jaggedness = 0.06): string {
  const verts = frontierPoints(f, jaggedness).map(
    ([x, y]) => [x * 100, y * 100] as [number, number]
  );

  // Close the polygon around the side opposite the ignition edge.
  const horizontal = f.side === "left" || f.side === "right";
  let tail: [number, number][];
  if (f.side === "left") {
    tail = [
      [100, 100],
      [100, 0],
    ];
  } else if (f.side === "right") {
    tail = [
      [0, 100],
      [0, 0],
    ];
  } else if (f.side === "top") {
    tail = [
      [100, 100],
      [0, 100],
    ];
  } else {
    tail = [
      [0, 0],
      [100, 0],
    ];
  }

  // For the left side the polygon runs: frontier top→bottom, then the tail
  // corners. Other sides order the tail so the ring stays simple.
  const ring = [...verts, ...tail];
  void horizontal;

  return `polygon(${ring
    .map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`)
    .join(", ")})`;
}

/** Frontier vertices in element pixel space, for the glow line and flames. */
export function burnFrontier(
  f: Frontier,
  rect: Rect,
  jaggedness = 0.06
): Vec[] {
  return frontierPoints(f, jaggedness).map(([x, y]) => ({
    x: rect.x + x * rect.width,
    y: rect.y + y * rect.height,
  }));
}

// Char filter keyframes: singed → charcoal.
const KEYFRAMES: [number, { b: number; c: number; se: number; sa: number }][] =
  [
    [0, { b: 1, c: 1, se: 0, sa: 1 }],
    [0.25, { b: 0.85, c: 1.1, se: 0.6, sa: 1.4 }],
    [0.7, { b: 0.3, c: 1.4, se: 1, sa: 0.4 }],
    [1, { b: 0.12, c: 1.6, se: 1, sa: 0.2 }],
  ];

/** Inline CSS filter for the char ramp. 0 → "none". */
export function charFilter(progress: number): string {
  const p = clamp01(progress);
  if (p === 0) {
    return "none";
  }

  let lower = KEYFRAMES[0];
  let upper = KEYFRAMES[KEYFRAMES.length - 1];
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i][0] && p <= KEYFRAMES[i + 1][0]) {
      lower = KEYFRAMES[i];
      upper = KEYFRAMES[i + 1];
      break;
    }
  }

  const span = upper[0] - lower[0];
  const t = span === 0 ? 0 : (p - lower[0]) / span;
  const lerp = (a: number, b: number) => a + (b - a) * t;

  const b = lerp(lower[1].b, upper[1].b);
  const c = lerp(lower[1].c, upper[1].c);
  const se = lerp(lower[1].se, upper[1].se);
  const sa = lerp(lower[1].sa, upper[1].sa);

  return `brightness(${b.toFixed(3)}) contrast(${c.toFixed(3)}) sepia(${se.toFixed(3)}) saturate(${sa.toFixed(3)})`;
}
