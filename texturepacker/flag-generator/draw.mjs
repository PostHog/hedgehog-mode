// A tiny vector DSL for drawing flags, rasterised into the house pixel style.
//
// Every flag is drawn on a 30x20 design canvas (x right, y down), whatever its
// real-world proportions: the hedgehog's cloth is one fixed size, so Swiss and
// Qatari flags get normalised along with everybody else. Shapes are layered in
// order — later ones paint over earlier ones.
//
// The design canvas is mapped onto the cloth's 28x19 interior; `renderCloth`
// then adds the 1px outline and darkens the bottom row, matching the
// hand-drawn flags that shipped first.
import { createImage } from "./png.mjs";

export const DESIGN_WIDTH = 30;
export const DESIGN_HEIGHT = 20;

export const CLOTH_WIDTH = 30;
export const CLOTH_HEIGHT = 21;
const INTERIOR_WIDTH = CLOTH_WIDTH - 2;
const INTERIOR_HEIGHT = CLOTH_HEIGHT - 2;

// Match the hand-drawn flags' palette for the two colours everybody shares.
export const WHITE = "#fff8f0";
export const BLACK = "#1a1a1a";
const OUTLINE = [40, 22, 12, 255];
const SHADE = 0.8;

// Subsamples per pixel, per axis. Each pixel takes the colour that covers most
// of it (see `weight` below), which keeps edges crisp instead of anti-aliased.
const SAMPLES = 5;

/**
 * @typedef {object} Shape
 * @property {(x: number, y: number) => boolean} contains
 * @property {string} color
 * @property {number} [weight] How hard this shape fights for a pixel it only
 *   partly covers. Small emblems (stars, discs) default above 1 so they don't
 *   vanish into the field at 28x19.
 */

/** @typedef {Shape | Layer[]} Layer */

const shape = (contains, color, weight = 1) => ({ contains, color, weight });

// --- Fields -----------------------------------------------------------------

/** Horizontal stripes, top to bottom. `weights` sets relative heights. */
export function hstripes(colors, weights = colors.map(() => 1)) {
  const total = sum(weights);
  let y = 0;
  return colors.map((color, i) => {
    const top = y;
    y += (weights[i] / total) * DESIGN_HEIGHT;
    return rect(0, top, DESIGN_WIDTH, y - top, color);
  });
}

/** Vertical stripes, hoist to fly. `weights` sets relative widths. */
export function vstripes(colors, weights = colors.map(() => 1)) {
  const total = sum(weights);
  let x = 0;
  return colors.map((color, i) => {
    const left = x;
    x += (weights[i] / total) * DESIGN_WIDTH;
    return rect(left, 0, x - left, DESIGN_HEIGHT, color);
  });
}

export const fill = (color) => rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, color);

// --- Primitives ---------------------------------------------------------------

export function rect(x, y, w, h, color, weight) {
  return shape(
    (px, py) => px >= x && px < x + w && py >= y && py < y + h,
    color,
    weight
  );
}

export function circle(cx, cy, r, color, weight = 1.5) {
  return shape(
    (px, py) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r,
    color,
    weight
  );
}

/** A circle with another bitten out of it — crescents, rings. */
export function crescent(cx, cy, r, bx, by, br, color, weight = 1.5) {
  return shape(
    (px, py) =>
      (px - cx) ** 2 + (py - cy) ** 2 <= r * r &&
      (px - bx) ** 2 + (py - by) ** 2 > br * br,
    color,
    weight
  );
}

export const ring = (cx, cy, r, thickness, color, weight) =>
  crescent(cx, cy, r, cx, cy, r - thickness, color, weight);

/** Any simple polygon: `[[x, y], ...]` in design units. */
export function poly(points, color, weight) {
  return shape((px, py) => insidePolygon(points, px, py), color, weight);
}

/** A thick straight line from (x0, y0) to (x1, y1) — diagonal bands, saltires. */
export function band(x0, y0, x1, y1, thickness, color, weight) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const length = Math.hypot(dx, dy);
  return shape(
    (px, py) => {
      const along = ((px - x0) * dx + (py - y0) * dy) / length;
      const across = Math.abs((px - x0) * dy - (py - y0) * dx) / length;
      return along >= 0 && along <= length && across <= thickness / 2;
    },
    color,
    weight
  );
}

/**
 * An n-pointed star. `inner` is the inner radius as a fraction of `r`;
 * `rotation` (radians) turns it clockwise from point-up.
 */
export function star(
  cx,
  cy,
  r,
  color,
  { points = 5, inner = 0.4, rotation = 0, weight = 2.5 } = {}
) {
  const vertices = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? r : r * inner;
    const angle = rotation + (i * Math.PI) / points;
    vertices.push([
      cx + radius * Math.sin(angle),
      cy - radius * Math.cos(angle),
    ]);
  }
  return poly(vertices, color, weight);
}

/**
 * Hand-placed pixels, for detail too small to survive rasterising (the US
 * canton's stars, an emblem that's 3px tall anyway). Unlike everything else
 * this is in *cloth interior pixels* — 28x19, (0, 0) just inside the border —
 * so what you write is exactly what you get. `rows` are strings; each
 * character is looked up in `palette`, and anything not in it is left alone.
 *
 *   pixels(5, 7, [".y.", "yyy", ".y."], { y: "#fcd116" })
 */
export function pixels(x, y, rows, palette) {
  return rows.flatMap((row, dy) =>
    [...row].flatMap((char, dx) => {
      const color = palette[char];
      if (!color) {
        return [];
      }
      const px = x + dx;
      const py = y + dy;
      return shape(
        (sx, sy) =>
          Math.floor((sx / DESIGN_WIDTH) * INTERIOR_WIDTH) === px &&
          Math.floor((sy / DESIGN_HEIGHT) * INTERIOR_HEIGHT) === py,
        color,
        // Win the pixel outright, whatever else is under it.
        1000
      );
    })
  );
}

// --- Compositions ---------------------------------------------------------------

/** A full-width/height cross through (cx, cy): Nordic crosses, St George. */
export function cross(cx, cy, thickness, color, weight) {
  return [
    rect(0, cy - thickness / 2, DESIGN_WIDTH, thickness, color, weight),
    rect(cx - thickness / 2, 0, thickness, DESIGN_HEIGHT, color, weight),
  ];
}

/** Corner-to-corner diagonals. */
export function saltire(thickness, color, weight) {
  return [
    band(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, thickness, color, weight),
    band(0, DESIGN_HEIGHT, DESIGN_WIDTH, 0, thickness, color, weight),
  ];
}

/**
 * Draw `layers` (in full design units) squeezed into a box — cantons, inset
 * emblems. `box(0, 0, 15, 10, unionJack())` is the Australian canton.
 */
export function box(x, y, w, h, layers) {
  const sx = w / DESIGN_WIDTH;
  const sy = h / DESIGN_HEIGHT;
  return flatten(layers).map((s) =>
    shape(
      (px, py) =>
        px >= x &&
        px < x + w &&
        py >= y &&
        py < y + h &&
        s.contains((px - x) / sx, (py - y) / sy),
      s.color,
      s.weight
    )
  );
}

/** Mirror layers left-to-right (e.g. a fly-side emblem drawn hoist-side). */
export function mirror(layers) {
  return flatten(layers).map((s) =>
    shape((px, py) => s.contains(DESIGN_WIDTH - px, py), s.color, s.weight)
  );
}

export const UK_RED = "#c8102e";
export const UK_BLUE = "#012169";

/** The Union Jack, full size. Wrap in `box` for a canton. */
export function unionJack() {
  return [
    fill(UK_BLUE),
    saltire(4, WHITE),
    saltire(1.5, UK_RED),
    cross(15, 10, 6, WHITE),
    cross(15, 10, 3.5, UK_RED),
  ];
}

/**
 * A British ensign: the Union Jack in the canton of `field` (a colour, or
 * layers for a patterned field), with `badge` layers on top.
 */
export function ensign(field, ...badge) {
  return [
    typeof field === "string" ? fill(field) : field,
    box(0, 0, 15, 10, unionJack()),
    ...badge,
  ];
}

// Five-pointed stars as hand-placed pixels, keyed by height, for when a vector
// `star` that small would rasterise into a blob.
const PIXEL_STARS = {
  3: [".s.", "sss", ".s."],
  4: ["..s..", "sssss", ".sss.", ".s.s."],
  5: ["..s..", ".sss.", "sssss", ".sss.", ".s.s."],
  7: [
    "...s...",
    "...s...",
    "..sss..",
    "sssssss",
    "..sss..",
    ".ss.ss.",
    ".s...s.",
  ],
};

/** A `size`-pixel-tall star whose box's top-left is interior pixel (x, y). */
export const pixelStar = (x, y, color, size = 5) =>
  pixels(x, y, PIXEL_STARS[size], { s: color });

/**
 * A star-studded canton or ring: `count` stars of radius `r` evenly placed on
 * a circle of radius `ringRadius` around (cx, cy), first one at the top.
 */
export function starRing(cx, cy, ringRadius, count, r, color, options) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count;
    return star(
      cx + ringRadius * Math.sin(angle),
      cy - ringRadius * Math.cos(angle),
      r,
      color,
      options
    );
  });
}

// --- Rendering ---------------------------------------------------------------

/**
 * @param {{ layers: Layer[], outline?: [number, number][] }} flag `outline` is an
 *   optional polygon (design units) for non-rectangular flags — Nepal. Pixels
 *   outside it stay transparent and the dark border follows its edge.
 */
export function renderCloth(flag) {
  const shapes = flatten(flag.layers);
  const innerW = INTERIOR_WIDTH;
  const innerH = INTERIOR_HEIGHT;

  // Pass 1: the interior, one winning colour (or nothing) per pixel.
  const interior = [];
  for (let y = 0; y < innerH; y++) {
    for (let x = 0; x < innerW; x++) {
      interior.push(samplePixel(shapes, flag.outline, x, y, innerW, innerH));
    }
  }
  const at = (x, y) =>
    x >= 0 && y >= 0 && x < innerW && y < innerH
      ? interior[y * innerW + x]
      : null;

  // Pass 2: compose onto the cloth with a border and a shaded bottom edge.
  const image = createImage(CLOTH_WIDTH, CLOTH_HEIGHT);
  for (let y = 0; y < CLOTH_HEIGHT; y++) {
    for (let x = 0; x < CLOTH_WIDTH; x++) {
      const ix = x - 1;
      const iy = y - 1;
      let rgba = null;
      const color = at(ix, iy);
      if (color) {
        rgba = parseColor(color);
        if (!at(ix, iy + 1)) {
          rgba = rgba.map((c, i) => (i === 3 ? c : Math.floor(c * SHADE)));
        }
      } else if (touches(at, ix, iy)) {
        rgba = OUTLINE;
      }
      if (rgba) {
        image.data.set(rgba, (y * CLOTH_WIDTH + x) * 4);
      }
    }
  }
  return image;
}

function samplePixel(shapes, outline, x, y, innerW, innerH) {
  const votes = new Map();
  for (let sy = 0; sy < SAMPLES; sy++) {
    for (let sx = 0; sx < SAMPLES; sx++) {
      const px = ((x + (sx + 0.5) / SAMPLES) / innerW) * DESIGN_WIDTH;
      const py = ((y + (sy + 0.5) / SAMPLES) / innerH) * DESIGN_HEIGHT;
      let winner = null;
      if (!outline || insidePolygon(outline, px, py)) {
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (shapes[i].contains(px, py)) {
            winner = shapes[i];
            break;
          }
        }
      }
      const key = winner?.color ?? null;
      votes.set(key, (votes.get(key) ?? 0) + (winner?.weight ?? 1));
    }
  }
  let best = null;
  let bestVotes = -1;
  for (const [color, count] of votes) {
    if (count > bestVotes) {
      best = color;
      bestVotes = count;
    }
  }
  return best;
}

function touches(at, x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (at(x + dx, y + dy)) {
        return true;
      }
    }
  }
  return false;
}

function insidePolygon(points, px, py) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function parseColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

/** @returns {Shape[]} */
export function flatten(layers) {
  return Array.isArray(layers) ? layers.flatMap(flatten) : [layers];
}

const sum = (values) => values.reduce((a, b) => a + b, 0);
