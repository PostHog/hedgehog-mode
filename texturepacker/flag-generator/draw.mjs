// The flag generator: every flag the hedgehog can hold is a 31x21 "cloth"
// generated from a spec, never drawn by hand. This file is the drawing DSL
// those specs are written in, and the rasteriser that turns one into a cloth.
//
// Pipeline:
//
//   countries/*.mjs   one spec per flag: `{ layers, outline? }`, built from
//                     this DSL and the emblems in helpers.mjs
//   generate.mjs      renders each spec with `renderCloth` and writes
//                     texturepacker/assets/flags/<slug>.png
//   append-to-atlas   packs new or changed PNGs into
//                     hedgehog-mode/assets/sprites.{png,json}
//
//   pnpm flags                              # generate + repack
//   pnpm flags:check                        # CI: fail if any cloth or the atlas is stale
//   pnpm flags:preview <out.png> --only a,b # contact sheet, writes nothing
//
// Two coordinate systems:
//
// - The vector shapes (`rect`, `circle`, `star`, ...) live on a 30x20 design
//   canvas (x right, y down), whatever the flag's real proportions: the cloth
//   is one fixed size, so Swiss and Qatari flags get normalised along with
//   everybody else.
// - The `pixel*` primitives, `pixels` and `cellsWhere` address the cloth's
//   29x19 interior directly, one unit per pixel.
//
// Shapes are layered in order, later ones painting over earlier ones.
// `renderCloth` maps the design canvas onto the interior, then adds the 1px
// outline and darkens the bottom row; that and the shared WHITE/BLACK are the
// house style every cloth keeps.
import { createImage } from "./png.mjs";

/**
 * @typedef {object} Shape One paintable region of a flag.
 * @property {(x: number, y: number) => boolean} contains Whether a design
 *   point (30x20 canvas) is inside the shape.
 * @property {string} color `#rrggbb`.
 * @property {number} weight How hard this shape fights for a pixel it only
 *   partly covers. Small emblems (stars, discs) default above 1 so they don't
 *   vanish into the field at 29x19; `pixelCells` uses 1000 to always win.
 */

/** @typedef {Shape | Layer[]} Layer A shape, or any nesting of them. */

/** @typedef {string[]} Rows A pixel grid, one string per row; "." is empty. */

/** @typedef {[number, number]} Cell An `[x, y]` interior pixel (or offset). */

/** @typedef {[number, number]} Point An `[x, y]` point in design units. */

/**
 * @typedef {object} Flag A flag spec, as each `countries/*.mjs` exports them.
 * @property {Layer[]} layers Painted bottom to top.
 * @property {Point[]} [outline] A polygon for non-rectangular flags (Nepal):
 *   pixels outside it stay transparent and the dark border follows its edge.
 */

/** @typedef {import("./png.mjs").Image} Image */

/** Width of the design canvas the vector shapes are drawn on. */
const DESIGN_WIDTH = 30;
/** Height of the design canvas the vector shapes are drawn on. */
const DESIGN_HEIGHT = 20;

/** Width of the whole cloth PNG, border included. */
export const CLOTH_WIDTH = 31;
/** Height of the whole cloth PNG, border included. */
export const CLOTH_HEIGHT = 21;
/** The cloth inside its 1px border: what `pixels` and every `pixel*` address. */
export const INTERIOR_WIDTH = CLOTH_WIDTH - 2;
/** Interior height; see `INTERIOR_WIDTH`. */
export const INTERIOR_HEIGHT = CLOTH_HEIGHT - 2;
/**
 * The middle column. Both interior dimensions are odd, so this and `MID_Y`
 * are real pixels: an odd-width emblem centres exactly with
 * `x = MID_X - (w - 1) / 2`.
 */
export const MID_X = (INTERIOR_WIDTH - 1) / 2;
/** The middle row; see `MID_X`. */
export const MID_Y = (INTERIOR_HEIGHT - 1) / 2;
/**
 * The centre of the middle pixel in the continuous pixel coordinates
 * `cellsWhere` tests in, where pixel (0, 0) spans 0..1.
 */
export const CENTER_X = MID_X + 0.5;
/** The middle pixel's centre, vertically; see `CENTER_X`. */
export const CENTER_Y = MID_Y + 0.5;

/** The house white, shared by every flag that has one. */
export const WHITE = "#fff8f0";
/** The house black, shared by every flag that has one. */
export const BLACK = "#1a1a1a";
/** The cloth's 1px border, RGBA. */
const OUTLINE = [40, 22, 12, 255];
/** How much the bottom row of the cloth is darkened. */
const SHADE = 0.8;

/**
 * Subsamples per pixel, per axis. Each pixel takes the colour that covers most
 * of it (see `Shape.weight`), which keeps edges crisp instead of anti-aliased.
 */
const SAMPLES = 5;

/**
 * Builds a `Shape`.
 * @param {(x: number, y: number) => boolean} contains
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
const shape = (contains, color, weight = 1) => ({ contains, color, weight });

// --- Fields -----------------------------------------------------------------

/**
 * Horizontal stripes, top to bottom.
 * @param {string[]} colors
 * @param {number[]} [weights] Relative heights; equal by default.
 * @returns {Shape[]}
 */
export function hstripes(colors, weights = colors.map(() => 1)) {
  const total = sum(weights);
  let y = 0;
  return colors.map((color, i) => {
    const top = y;
    y += (weights[i] / total) * DESIGN_HEIGHT;
    return rect(0, top, DESIGN_WIDTH, y - top, color);
  });
}

/**
 * Vertical stripes, hoist to fly.
 * @param {string[]} colors
 * @param {number[]} [weights] Relative widths; equal by default.
 * @returns {Shape[]}
 */
export function vstripes(colors, weights = colors.map(() => 1)) {
  const total = sum(weights);
  let x = 0;
  return colors.map((color, i) => {
    const left = x;
    x += (weights[i] / total) * DESIGN_WIDTH;
    return rect(left, 0, x - left, DESIGN_HEIGHT, color);
  });
}

/**
 * The whole cloth in one colour.
 * @param {string} color
 * @returns {Shape}
 */
export const fill = (color) => rect(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, color);

// --- Primitives ---------------------------------------------------------------

/**
 * An axis-aligned rectangle, in design units.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
export function rect(x, y, w, h, color, weight) {
  return shape(
    (px, py) => px >= x && px < x + w && py >= y && py < y + h,
    color,
    weight
  );
}

/**
 * A circle, in design units.
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
export function circle(cx, cy, r, color, weight = 1.5) {
  return shape(
    (px, py) => (px - cx) ** 2 + (py - cy) ** 2 <= r * r,
    color,
    weight
  );
}

/**
 * A circle with another bitten out of it — crescents, rings.
 * @param {number} cx The circle's centre and radius.
 * @param {number} cy
 * @param {number} r
 * @param {number} bx The bite's centre and radius.
 * @param {number} by
 * @param {number} br
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
export function crescent(cx, cy, r, bx, by, br, color, weight = 1.5) {
  return shape(
    (px, py) =>
      (px - cx) ** 2 + (py - cy) ** 2 <= r * r &&
      (px - bx) ** 2 + (py - by) ** 2 > br * br,
    color,
    weight
  );
}

/**
 * Any simple polygon, in design units.
 * @param {Point[]} points
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
export function poly(points, color, weight) {
  return shape((px, py) => insidePolygon(points, px, py), color, weight);
}

/**
 * A thick straight line from (x0, y0) to (x1, y1) — diagonal bands, saltires.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} thickness
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
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
 * An n-pointed vector star. Below ~7px tall `pixelStar` reads better.
 * @param {number} cx
 * @param {number} cy
 * @param {number} r Centre to point.
 * @param {string} color
 * @param {object} [options]
 * @param {number} [options.points]
 * @param {number} [options.inner] Inner radius as a fraction of `r`.
 * @param {number} [options.rotation] Radians clockwise from point-up.
 * @param {number} [options.weight]
 * @returns {Shape}
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
 * One `pixelCells` layer per colour, in order of first appearance.
 * @param {Iterable<[Cell, string]>} painted Each cell with its colour.
 * @returns {Shape[]}
 */
function byColor(painted) {
  const cells = new Map();
  for (const [cell, color] of painted) {
    if (!cells.has(color)) {
      cells.set(color, []);
    }
    cells.get(color).push(cell);
  }
  return [...cells].map(([color, list]) => pixelCells(list, color));
}

/**
 * Hand-placed pixels, for detail too small to survive rasterising (the US
 * canton's stars, an emblem that's 3px tall anyway). Unlike the vector shapes
 * this is in *cloth interior pixels* — 29x19, (0, 0) just inside the border —
 * so what you write is exactly what you get. Each character is looked up in
 * `palette`, and anything not in it is left alone.
 *
 *   pixels(5, 7, [".y.", "yyy", ".y."], { y: "#fcd116" })
 *
 * @param {number} x Top-left interior pixel of the grid.
 * @param {number} y
 * @param {Rows} rows
 * @param {Record<string, string>} palette Character → colour.
 * @returns {Shape[]} One layer per colour.
 */
export function pixels(x, y, rows, palette) {
  return byColor(
    rows.flatMap((row, dy) =>
      [...row].flatMap((char, dx) =>
        palette[char] ? [[[x + dx, y + dy], palette[char]]] : []
      )
    )
  );
}

/**
 * One shape covering exactly these interior pixels, winning each outright
 * whatever else is under it. Everything `pixel*` below is built on this.
 * Cells off the interior are dropped.
 * @param {Cell[]} cells
 * @param {string} color
 * @returns {Shape}
 */
export function pixelCells(cells, color) {
  const set = new Set(
    cells
      .filter(
        ([x, y]) =>
          x >= 0 && y >= 0 && x < INTERIOR_WIDTH && y < INTERIOR_HEIGHT
      )
      .map(([x, y]) => y * INTERIOR_WIDTH + x)
  );
  return shape(
    (sx, sy) =>
      set.has(
        Math.floor((sy / DESIGN_HEIGHT) * INTERIOR_HEIGHT) * INTERIOR_WIDTH +
          Math.floor((sx / DESIGN_WIDTH) * INTERIOR_WIDTH)
      ),
    color,
    1000
  );
}

// --- Pixel primitives ---------------------------------------------------------
//
// The vector shapes above live on the 30x20 design canvas, which maps onto the
// 29x19 interior unevenly, so a "centred" star or a "round" disc can come out
// a pixel lopsided. These work in interior pixels instead (like `pixels`) and
// are symmetric by construction. Each takes the top-left pixel of its box, so
// centring a `w`-wide one is `x = cx - (w - 1) / 2`.

/**
 * The filled cells of a grid, as offsets from its top-left.
 * @param {Rows} rows
 * @returns {Cell[]}
 */
const cellsOf = (rows) =>
  rows.flatMap((row, dy) =>
    [...row].flatMap((char, dx) => (char === "." ? [] : [[dx, dy]]))
  );

/**
 * Rotates a grid a quarter turn clockwise `turns` times.
 * @param {Rows} rows
 * @param {number} turns
 * @returns {Rows}
 */
const turn = (rows, turns) => {
  let grid = rows;
  for (let t = 0; t < ((turns % 4) + 4) % 4; t++) {
    grid = [...grid[0]].map((_, x) =>
      grid
        .map((row) => row[x])
        .reverse()
        .join("")
    );
  }
  return grid;
};

/**
 * A grid's filled cells in one colour, its top-left at interior pixel (x, y).
 * @param {number} x
 * @param {number} y
 * @param {Rows} rows
 * @param {string} color
 * @returns {Shape}
 */
const place = (x, y, rows, color) =>
  pixelCells(
    cellsOf(rows).map(([dx, dy]) => [x + dx, y + dy]),
    color
  );

/**
 * Samples a shape into a `w`x`h` grid of "s"/"." rows, 6x6 samples a pixel.
 * @param {number} w
 * @param {number} h
 * @param {(u: number, v: number) => boolean} test `u`, `v` in [0, 1) across
 *   the box.
 * @param {number} [threshold] Fraction of samples that must hit.
 * @returns {Rows}
 */
function rasterise(w, h, test, threshold = 0.5) {
  const n = 6;
  return Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      let hits = 0;
      for (let j = 0; j < n; j++) {
        for (let i = 0; i < n; i++) {
          hits += test((x + (i + 0.5) / n) / w, (y + (j + 0.5) / n) / h)
            ? 1
            : 0;
        }
      }
      return hits / (n * n) >= threshold ? "s" : ".";
    }).join("")
  );
}

/**
 * Forces left-right symmetry by mirroring each row's left half over its right.
 * @param {Rows} rows
 * @returns {Rows}
 */
const symmetricX = (rows) =>
  rows.map((row) => {
    const half = row.slice(0, Math.ceil(row.length / 2));
    return (
      half + [...half.slice(0, Math.floor(row.length / 2))].reverse().join("")
    );
  });

/**
 * Forces top-bottom symmetry by mirroring the top half over the bottom.
 * @param {Rows} rows
 * @returns {Rows}
 */
const symmetricY = (rows) =>
  rows.map((row, y) =>
    y < Math.ceil(rows.length / 2) ? row : rows[rows.length - 1 - y]
  );

/** Stars too small to rasterise well, drawn by hand. Keyed by height. */
const SMALL_STARS = {
  1: ["s"],
  2: ["ss", "ss"],
  // Too small for five points; a twinkle reads as a star where an "A" doesn't.
  3: [".s.", "sss", ".s."],
  4: ["..s..", "sssss", ".sss.", ".s.s."],
  // A sharp top and splayed legs that still share an edge with the body, so
  // it reads as pointy without breaking into pieces at 1x.
  5: ["..s..", "..s..", "sssss", ".sss.", "ss.ss"],
  6: ["...s...", "..sss..", "sssssss", ".sssss.", "..sss..", ".ss.ss."],
  7: [
    "...s...",
    "...s...",
    "..sss..",
    "sssssss",
    ".sssss.",
    ".ss.ss.",
    ".s...s.",
  ],
};

/** Fraction of a pixel a rasterised star must cover to be drawn. */
const STAR_THRESHOLD = 0.3;
/** A rasterised star's inner radius, as a fraction of its outer one. */
const STAR_INNER = 0.42;

/**
 * A five-pointed star's pixel rows, point up: hand-drawn up to 7px, rasterised
 * and kept symmetric above.
 * @param {number} size Height in pixels.
 * @returns {Rows}
 */
function starRows(size) {
  if (SMALL_STARS[size]) {
    return SMALL_STARS[size];
  }
  // A regular star, point up, scaled so its points just touch the box; the
  // bottom points sit at cos(36°) of the radius below the centre.
  const r = size / (1 + Math.cos(Math.PI / 5));
  let w = Math.round(2 * r * Math.sin((2 * Math.PI) / 5));
  w += w % 2 ? 0 : 1;
  const vertices = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 ? r * STAR_INNER : r;
    const angle = (i * Math.PI) / 5;
    return [w / 2 + radius * Math.sin(angle), r - radius * Math.cos(angle)];
  });
  return symmetricX(
    rasterise(
      w,
      size,
      (u, v) => insidePolygon(vertices, u * w, v * size),
      STAR_THRESHOLD
    )
  );
}

/**
 * A `size`-pixel-tall five-pointed star whose box's top-left is interior
 * pixel (x, y).
 * @param {number} x
 * @param {number} y
 * @param {string} color
 * @param {number} [size]
 * @param {object} [options]
 * @param {number} [options.turns] Quarter turns clockwise: 1 points to the
 *   fly, 3 to the hoist.
 * @returns {Shape}
 */
export const pixelStar = (x, y, color, size = 5, { turns = 0 } = {}) =>
  place(x, y, turn(starRows(size), turns), color);

/** Discs too small for the circle test to look round, drawn by hand. */
const SMALL_DISCS = {
  1: ["s"],
  2: ["ss", "ss"],
  3: [".s.", "sss", ".s."],
  4: [".ss.", "ssss", "ssss", ".ss."],
  5: [".sss.", "sssss", "sssss", "sssss", ".sss."],
  6: [".ssss.", "ssssss", "ssssss", "ssssss", "ssssss", ".ssss."],
};

/**
 * A disc's pixel rows, symmetric on both axes.
 * @param {number} diameter
 * @returns {Rows}
 */
export function discRows(diameter) {
  if (SMALL_DISCS[diameter]) {
    return SMALL_DISCS[diameter];
  }
  const rows = rasterise(
    diameter,
    diameter,
    (u, v) => (u - 0.5) ** 2 + (v - 0.5) ** 2 <= 0.25
  );
  return symmetricY(symmetricX(rows));
}

/**
 * A round disc, box top-left at (x, y).
 * @param {number} x
 * @param {number} y
 * @param {number} diameter
 * @param {string} color
 * @returns {Shape}
 */
export const pixelDisc = (x, y, diameter, color) =>
  place(x, y, discRows(diameter), color);

/**
 * A ring: a disc with a smaller one, `thickness` in, left unpainted.
 * @param {number} x
 * @param {number} y
 * @param {number} diameter
 * @param {number} thickness
 * @param {string} color
 * @returns {Shape}
 */
export function pixelRing(x, y, diameter, thickness, color) {
  const outer = discRows(diameter);
  const inner = discRows(diameter - 2 * thickness);
  const rows = outer.map((row, dy) =>
    [...row]
      .map((char, dx) =>
        inner[dy - thickness]?.[dx - thickness] === "s" ? "." : char
      )
      .join("")
  );
  return place(x, y, rows, color);
}

/**
 * @typedef {object} CrescentOptions
 * @property {number} [bite] The bitten-out disc's diameter, as a fraction of
 *   the moon's.
 * @property {number} [shift] How far the bite is pushed towards the opening,
 *   as a fraction of the diameter; raise it for a fatter crescent.
 * @property {number} [threshold] Fraction of a pixel that must be covered.
 */

/**
 * A crescent's pixel rows, horns to the right: a disc with a second disc
 * bitten out. The defaults give a properly curved moon with thin horns.
 * @param {number} diameter
 * @param {CrescentOptions} [options]
 * @returns {Rows}
 */
function crescentRows(
  diameter,
  { bite = 0.85, shift = 0.2, threshold = 0.3 } = {}
) {
  const r = 0.5;
  const br = (bite * diameter) / 2 / diameter;
  const rows = rasterise(
    diameter,
    diameter,
    (u, v) =>
      (u - 0.5) ** 2 + (v - 0.5) ** 2 <= r * r &&
      (u - 0.5 - shift) ** 2 + (v - 0.5) ** 2 > br * br,
    // Low, or the horns' thin tips round away and the moon goes blunt.
    threshold
  );
  return symmetricY(rows);
}

/** Quarter turns from `crescentRows`' right-facing moon to each facing. */
const FACING = { right: 0, down: 1, left: 2, up: 3 };

/**
 * A crescent moon `diameter` pixels tall, box top-left at (x, y).
 * @param {number} x
 * @param {number} y
 * @param {number} diameter
 * @param {string} color
 * @param {CrescentOptions & { facing?: "right" | "down" | "left" | "up" }} [options]
 *   `facing` is where the horns point; "right" (the fly) by default.
 * @returns {Shape}
 */
export const pixelCrescent = (
  x,
  y,
  diameter,
  color,
  { facing = "right", ...options } = {}
) => place(x, y, turn(crescentRows(diameter, options), FACING[facing]), color);

/**
 * A solid rectangle of interior pixels.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} color
 * @returns {Shape}
 */
export const pixelRect = (x, y, w, h, color) =>
  place(
    x,
    y,
    Array.from({ length: h }, () => "s".repeat(w)),
    color
  );

/**
 * A full-width, full-height cross in whole pixels, both arms equally thick.
 * @param {number} x First column of the vertical bar.
 * @param {number} y First row of the horizontal bar.
 * @param {number} thickness
 * @param {string} color
 * @returns {Shape[]}
 */
export const pixelCross = (x, y, thickness, color) => [
  pixelRect(0, y, INTERIOR_WIDTH, thickness, color),
  pixelRect(x, 0, thickness, INTERIOR_HEIGHT, color),
];

/**
 * A Nordic (or St George) cross, fimbriated as many times as you like, every
 * band centred on the same crossing. Each outer band should be 2n thicker so
 * the border is n pixels on every side.
 *
 *   nordicCross(8, 8, [[5, WHITE], [3, "#c8102e"]])   // Norway-ish
 *
 * @param {number} x Top-left pixel of the innermost band's crossing.
 * @param {number} y
 * @param {[number, string][]} bands `[thickness, color]`, outermost first.
 * @returns {Shape[][]}
 */
export function nordicCross(x, y, bands) {
  const inner = bands[bands.length - 1][0];
  return bands.map(([thickness, color]) => {
    const pad = (thickness - inner) / 2;
    return pixelCross(x - pad, y - pad, thickness, color);
  });
}

/**
 * The hoist triangle in whole pixels, its point on the middle row: straight
 * edges, so no stray pixel of stripe pokes out where a stripe boundary falls
 * mid-row across them.
 * @param {number} depth Columns it covers on the middle row.
 * @param {string} color
 * @param {number} [slope] Columns lost per row away from the middle; 1 is 45°.
 * @returns {Shape}
 */
export const pixelHoistTriangle = (depth, color, slope = 1) =>
  pixelCells(
    cellsWhere((x, y) => x < depth + 0.5 - slope * Math.abs(y - 0.5 - MID_Y)),
    color
  );

/**
 * Every interior pixel whose centre passes `test`, for emblems easier to
 * describe as a shape than to draw: `pixelCells(cellsWhere(...), color)`.
 * @param {(x: number, y: number) => boolean} test Gets pixel coordinates, so
 *   the centre of pixel (0, 0) is (0.5, 0.5).
 * @returns {Cell[]}
 */
export function cellsWhere(test) {
  const cells = [];
  for (let y = 0; y < INTERIOR_HEIGHT; y++) {
    for (let x = 0; x < INTERIOR_WIDTH; x++) {
      if (test(x + 0.5, y + 0.5)) {
        cells.push([x, y]);
      }
    }
  }
  return cells;
}

/**
 * Rows from their left halves, mirrored, so the emblem is symmetric whatever
 * you draw.
 * @param {Rows} halves
 * @param {object} [options]
 * @param {boolean} [options.odd] Share each half's last column as the middle
 *   one, for odd widths that centre on `MID_X`; otherwise an n-wide half
 *   makes a 2n-wide row.
 * @returns {Rows}
 */
export const mirrorHalves = (halves, { odd = false } = {}) =>
  halves.map(
    (half) => half + [...(odd ? half.slice(0, -1) : half)].reverse().join("")
  );

/**
 * Offsets (from the centre, x right, y down) for `count` items in a ring of
 * radius `r`, the first at the top, as whole pixels. Rounding each item onto
 * the circle on its own leaves the gaps between neighbours uneven, which reads
 * as lumpy; so this searches the nearby pixels for the set that keeps the gaps
 * most even and the items closest to the radius, measured on a slightly
 * squared-off circle (`roundness` < 2) because a ring of single pixels reads a
 * touch square and its diagonals look further out than they are. The result
 * is always mirrored left to right, also top to bottom when `count` is even,
 * and about the diagonals when it's a multiple of four; neighbours never touch.
 * @param {number} r
 * @param {number} count
 * @param {object} [options]
 * @param {number} [options.radiusWeight] Radius error vs gap evenness.
 * @param {number} [options.roundness] The norm's exponent; 2 is a true circle.
 * @returns {Cell[]} Clockwise from the top.
 */
function ringOffsets(r, count, { radiusWeight = 2, roundness = 1.5 } = {}) {
  const even = count % 2 === 0;
  const norm = (x, y) =>
    (Math.abs(x) ** roundness + Math.abs(y) ** roundness) ** (1 / roundness);
  // One representative angle per mirror class: the right half, or just its
  // upper quadrant when the ring is also mirrored top to bottom.
  const reps = Array.from(
    { length: count },
    (_, i) => (i * 2 * Math.PI) / count
  ).filter((a) => a <= (even ? Math.PI / 2 : Math.PI) + 1e-9);
  const candidates = reps.map((a) => {
    const [ix, iy] = [r * Math.sin(a), -r * Math.cos(a)];
    const onVertical = Math.abs(Math.sin(a)) < 1e-9;
    const onHorizontal = Math.abs(Math.cos(a)) < 1e-9;
    const list = [];
    for (let dx = Math.floor(ix) - 1; dx <= Math.ceil(ix) + 1; dx++) {
      for (let dy = Math.floor(iy) - 1; dy <= Math.ceil(iy) + 1; dy++) {
        const offAxis = (onVertical && dx !== 0) || (onHorizontal && dy !== 0);
        if (dx < 0 || offAxis || (even && dy > 0)) continue;
        if (Math.abs(Math.hypot(dx, dy) - r) > 1.2) continue;
        list.push([dx, dy]);
      }
    }
    const fromIdeal = ([x, y]) => Math.hypot(x - ix, y - iy);
    return list.sort((p, q) => fromIdeal(p) - fromIdeal(q)).slice(0, 6);
  });
  // The mirror images of each picked point: left-right, and top-bottom too
  // when `count` is even.
  const flips = even
    ? [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]
    : [
        [1, 1],
        [-1, 1],
      ];
  const mirrored = (pick) => {
    const points = new Map();
    for (const [x, y] of pick) {
      for (const [fx, fy] of flips) {
        const [mx, my] = [fx * x, fy * y];
        points.set(`${mx},${my}`, [mx, my]);
      }
    }
    const angle = ([x, y]) => (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI);
    return [...points.values()].sort((p, q) => angle(p) - angle(q));
  };
  const spread = (values) => Math.max(...values) - Math.min(...values);
  let best = null;
  const search = (k, pick) => {
    if (k < candidates.length) {
      for (const c of candidates[k]) search(k + 1, [...pick, c]);
      return;
    }
    const points = mirrored(pick);
    if (points.length !== count) return;
    if (count % 4 === 0) {
      const keys = new Set(points.map(([x, y]) => `${x},${y}`));
      if (!points.every(([x, y]) => keys.has(`${-y},${-x}`))) return;
    }
    const steps = points.map(([x, y], i) => {
      const [nx, ny] = points[(i + 1) % points.length];
      return [
        Math.hypot(x - nx, y - ny),
        Math.max(Math.abs(x - nx), Math.abs(y - ny)),
      ];
    });
    if (steps.some(([, chebyshev]) => chebyshev < 2)) return;
    const error =
      points.reduce((sum, [x, y]) => sum + Math.abs(norm(x, y) - r), 0) /
      points.length;
    const score = spread(steps.map(([d]) => d)) + radiusWeight * error;
    if (!best || score < best.score) best = { score, points };
  };
  search(0, []);
  if (!best) {
    throw new Error(`no ring of ${count} fits radius ${r}`);
  }
  return best.points;
}

/**
 * `count` stars in an even ring round interior pixel (cx, cy) — see
 * `ringOffsets`.
 *
 *   pixelStarRing(MID_X, MID_Y, 7, 12, "#ffcc00")   // the EU
 *
 * @param {number} cx
 * @param {number} cy
 * @param {number} r
 * @param {number} count
 * @param {string} color
 * @param {(x: number, y: number) => Layer} [draw] The layer for one star
 *   centred on pixel (x, y); a single pixel of `color` by default.
 * @returns {Layer[]}
 */
export const pixelStarRing = (
  cx,
  cy,
  r,
  count,
  color,
  draw = (x, y) => pixelRect(x, y, 1, 1, color)
) => ringOffsets(r, count).map(([dx, dy]) => draw(cx + dx, cy + dy));

// --- Compositions ---------------------------------------------------------------

/**
 * A full-width/height vector cross through (cx, cy): Nordic crosses, St
 * George. `pixelCross` keeps both arms the same width.
 * @param {number} cx
 * @param {number} cy
 * @param {number} thickness
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape[]}
 */
export function cross(cx, cy, thickness, color, weight) {
  return [
    rect(0, cy - thickness / 2, DESIGN_WIDTH, thickness, color, weight),
    rect(cx - thickness / 2, 0, thickness, DESIGN_HEIGHT, color, weight),
  ];
}

/**
 * Corner-to-corner diagonals.
 * @param {number} thickness
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape[]}
 */
export function saltire(thickness, color, weight) {
  return [
    band(0, 0, DESIGN_WIDTH, DESIGN_HEIGHT, thickness, color, weight),
    band(0, DESIGN_HEIGHT, DESIGN_WIDTH, 0, thickness, color, weight),
  ];
}

/** The Union Jack's red. */
export const UK_RED = "#c8102e";
/** The Union Jack's blue, and the field of the blue ensigns. */
export const UK_BLUE = "#012169";

/**
 * The Union Jack in whole pixels, so St George's cross sits exactly on a
 * middle column and row. Keep both sides odd so there is one.
 * @param {number} x Top-left interior pixel.
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {Shape[]}
 */
export function pixelUnionJack(x, y, w, h) {
  const [cx, cy] = [(w - 1) / 2, (h - 1) / 2];
  // Thicknesses in pixels off the flag's height, as on the real one: St
  // George's cross 1/5 and its white edge 1/15 a side, each rounded to an
  // odd width so it has a middle pixel to sit on.
  const odd = (n) => 2 * Math.round((n - 1) / 2) + 1;
  const red = odd(h / 5);
  const white = red + 2 * Math.max(1, Math.round(h / 15));
  const diagonal = Math.hypot(w, h);
  const painted = [];
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const [u, v] = [px + 0.5, py + 0.5];
      const toSaltire =
        Math.min(Math.abs(u * h - v * w), Math.abs(u * h - (h - v) * w)) /
        diagonal;
      let color = UK_BLUE;
      if (toSaltire <= h / 9) color = WHITE;
      if (toSaltire <= h / 16) color = UK_RED;
      const [dx, dy] = [Math.abs(px - cx), Math.abs(py - cy)];
      if (dx <= (white - 1) / 2 || dy <= (white - 1) / 2) color = WHITE;
      if (dx <= (red - 1) / 2 || dy <= (red - 1) / 2) color = UK_RED;
      painted.push([[x + px, y + py], color]);
    }
  }
  return byColor(painted);
}

/**
 * A British ensign: the Union Jack in the canton, with `badge` layers on top.
 * The canton is 15x11 pixels: a touch taller than the real half-height one,
 * so St George's cross can be 3px of red with a white edge and still leave
 * the blue showing.
 * @param {string | Layer} field A colour, or layers for a patterned field.
 * @param {...Layer} badge
 * @returns {Layer[]}
 */
export function ensign(field, ...badge) {
  return [
    typeof field === "string" ? fill(field) : field,
    pixelUnionJack(0, 0, 15, 11),
    ...badge,
  ];
}

/**
 * The middle column of the fly beside an `ensign`'s 15-wide canton: the fly
 * half runs from the middle column (14) to 28, so an odd-width badge centred
 * here centres in it exactly and clears the canton.
 */
export const FLY_MID = 21;

// --- Rendering ---------------------------------------------------------------

/**
 * Rasterises a flag spec into a cloth: each interior pixel takes the colour
 * that wins most of its subsamples, then the cloth gets its 1px outline
 * (following the flag's edge, for non-rectangular ones) and a shaded bottom
 * row.
 * @param {Flag} flag
 * @returns {Image} `CLOTH_WIDTH`x`CLOTH_HEIGHT`.
 */
export function renderCloth(flag) {
  const shapes = flatten(flag.layers);

  // Pass 1: the interior, one winning colour (or nothing) per pixel.
  const interior = [];
  for (let y = 0; y < INTERIOR_HEIGHT; y++) {
    for (let x = 0; x < INTERIOR_WIDTH; x++) {
      interior.push(samplePixel(shapes, flag.outline, x, y));
    }
  }
  const at = (x, y) =>
    x >= 0 && y >= 0 && x < INTERIOR_WIDTH && y < INTERIOR_HEIGHT
      ? interior[y * INTERIOR_WIDTH + x]
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

/**
 * The colour of interior pixel (x, y): the topmost shape at each subsample
 * casts its weight as a vote, and the most votes win.
 * @param {Shape[]} shapes Bottom to top.
 * @param {Point[] | undefined} outline
 * @param {number} x
 * @param {number} y
 * @returns {string | null} `null` for transparent.
 */
function samplePixel(shapes, outline, x, y) {
  const votes = new Map();
  for (let sy = 0; sy < SAMPLES; sy++) {
    for (let sx = 0; sx < SAMPLES; sx++) {
      const px = ((x + (sx + 0.5) / SAMPLES) / INTERIOR_WIDTH) * DESIGN_WIDTH;
      const py = ((y + (sy + 0.5) / SAMPLES) / INTERIOR_HEIGHT) * DESIGN_HEIGHT;
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

/**
 * Whether (x, y) or any of its eight neighbours is painted.
 * @param {(x: number, y: number) => string | null} at
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
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

/**
 * Even-odd point-in-polygon test.
 * @param {Point[]} points
 * @param {number} px
 * @param {number} py
 * @returns {boolean}
 */
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

/**
 * `#rrggbb` → opaque RGBA.
 * @param {string} hex
 * @returns {number[]}
 */
function parseColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, 255];
}

/**
 * Every shape in a layer tree, bottom to top.
 * @param {Layer | Layer[]} layers
 * @returns {Shape[]}
 */
function flatten(layers) {
  return Array.isArray(layers) ? layers.flatMap(flatten) : [layers];
}

/**
 * Adds up `values`.
 * @param {number[]} values
 * @returns {number}
 */
const sum = (values) => values.reduce((a, b) => a + b, 0);
