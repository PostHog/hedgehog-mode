// Emblems and shared bits for the flag specs in countries/*.mjs.
//
// The flag generator turns each spec into the 31x21 cloth the hedgehog holds
// (spec → generate.mjs → texturepacker/assets/flags/<slug>.png →
// append-to-atlas.mjs → hedgehog-mode/assets/sprites.{png,json}; see draw.mjs
// for the DSL and `pnpm flags` / `pnpm flags:check` / `pnpm flags:preview`).
// draw.mjs holds the general-purpose primitives; this holds everything the
// country files would otherwise define for themselves: a few shared shapes and
// pixel grids, then the emblems that only one flag (or a handful) needs, each
// saying which.
//
// The pixel tests here are in `cellsWhere` coordinates (interior pixels, the
// centre of pixel (0, 0) at (0.5, 0.5)) unless they say otherwise.
import {
  BLACK,
  CENTER_X,
  CENTER_Y,
  INTERIOR_HEIGHT,
  INTERIOR_WIDTH,
  MID_X,
  MID_Y,
  WHITE,
  cellsWhere,
  discRows,
  pixelCells,
  pixels,
  poly,
} from "./draw.mjs";

/** @typedef {import("./draw.mjs").Shape} Shape */
/** @typedef {import("./draw.mjs").Rows} Rows */
/** @typedef {import("./draw.mjs").Cell} Cell */

/**
 * @typedef {(x: number, y: number) => boolean} PixelTest A shape as a
 *   predicate on pixel coordinates, for `cellsWhere`.
 */

// --- Shared colours ------------------------------------------------------------

/**
 * The pan-African gold: Mali, Papua New Guinea, the Philippines, Romania,
 * Saint Kitts and Nevis, Saint Lucia.
 */
export const GOLD = "#fcd116";

// --- Shared geometry -----------------------------------------------------------

/**
 * Distance from (px, py) to the segment (ax, ay)–(bx, by).
 * @param {number} px
 * @param {number} py
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number}
 */
export function segmentDistance(px, py, ax, ay, bx, by) {
  const [dx, dy] = [bx - ax, by - ay];
  const t = Math.max(
    0,
    Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))
  );
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/**
 * Folds a pixel test about the column through `cx`, so the cells it picks are
 * exactly mirror-symmetric whatever float noise the test has. Morocco.
 * @param {number} cx
 * @param {PixelTest} test
 * @returns {PixelTest}
 */
export const mirroredAbout = (cx, test) => (x, y) =>
  test(cx - Math.abs(x - cx), y);

/**
 * An isosceles triangle on the middle column. Saint Lucia.
 * @param {number} top Row of the apex.
 * @param {number} base Row of the base.
 * @param {number} halfWidth Pixels either side of the middle at the base.
 * @returns {PixelTest}
 */
export const triangle = (top, base, halfWidth) => (x, y) =>
  y >= top &&
  y <= base &&
  Math.abs(x - CENTER_X) <= (halfWidth * (y - top)) / (base - top);

/**
 * Rows centred on the middle column, each `2h + 1` wide. Antigua and Barbuda,
 * Brazil.
 * @param {number} y First row.
 * @param {number[]} halfWidths Pixels either side of the middle, per row.
 * @param {string} color
 * @returns {Shape[]}
 */
export const centred = (y, halfWidths, color) =>
  pixels(
    0,
    y,
    halfWidths.map((h) => ".".repeat(MID_X - h) + "s".repeat(2 * h + 1)),
    { s: color }
  );

/**
 * An ellipse as a 32-gon, in design units (draw.mjs only has circles).
 * Eswatini.
 * @param {number} cx
 * @param {number} cy
 * @param {number} rx
 * @param {number} ry
 * @param {string} color
 * @param {number} [weight]
 * @returns {Shape}
 */
export const ellipse = (cx, cy, rx, ry, color, weight) =>
  poly(
    Array.from({ length: 32 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 32;
      return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
    }),
    color,
    weight
  );

/**
 * A shape traced in interior pixels and mirrored onto both axes, so it comes
 * out symmetric however it rasterises: suns, shields. Kazakhstan, Kyrgyzstan.
 * @param {number} x Top-left of the `w`x`h` box.
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {(dx: number, dy: number) => boolean} test Gets pixel offsets from
 *   the middle of the box.
 * @param {string} color
 * @returns {Shape}
 */
export function pixelTrace(x, y, w, h, test, color) {
  const cells = [];
  for (let cy = 0; cy < Math.ceil(h / 2); cy++) {
    for (let cx = 0; cx < Math.ceil(w / 2); cx++) {
      let hits = 0;
      for (let j = 0; j < 6; j++) {
        for (let i = 0; i < 6; i++) {
          const dx = cx + (i + 0.5) / 6 - w / 2;
          const dy = cy + (j + 0.5) / 6 - h / 2;
          hits += test(dx, dy) ? 1 : 0;
        }
      }
      if (hits / 36 >= 0.5) {
        for (const [px, py] of [
          [cx, cy],
          [w - 1 - cx, cy],
          [cx, h - 1 - cy],
          [w - 1 - cx, h - 1 - cy],
        ]) {
          cells.push([x + px, y + py]);
        }
      }
    }
  }
  return pixelCells(cells, color);
}

/**
 * A sun for `pixelTrace`: a disc with rays reaching out round it. Kazakhstan,
 * Kyrgyzstan.
 * @param {number} core The disc's radius.
 * @param {number} reach How far the rays' tips are from the centre.
 * @param {number} rays
 * @param {number} [width] Each ray's half-width (in pixels, times its radius).
 * @param {number} [phase] Turns the rays (radians); half a step keeps a ray
 *   off the vertical, where on an odd-width sun it would be a 1px spike.
 * @returns {(dx: number, dy: number) => boolean}
 */
export const sunTest =
  (core, reach, rays, width = 0.35, phase = 0) =>
  (dx, dy) => {
    const r = Math.hypot(dx, dy);
    if (r <= core) {
      return true;
    }
    const step = (2 * Math.PI) / rays;
    const angle = Math.atan2(dx, -dy) + phase;
    const off = Math.abs((((angle % step) + step * 1.5) % step) - step / 2);
    return r <= reach && off * r <= width;
  };

// --- Shared pixel grids --------------------------------------------------------
//
// For `pixels(x, y, ROWS, { s: color })`.

/** A 5x5 burst: Argentina's Sun of May, Nauru's star, Nepal's sun. */
export const SMALL_SUN = ["s.s.s", ".sss.", "sssss", ".sss.", "s.s.s"];

/**
 * A 7x7 eight-rayed sun: the Philippines, Uruguay's Sun of May and Taiwan's
 * white sun (which paints its centre blue on top).
 */
export const EIGHT_RAY_SUN = [
  "...s...",
  ".s.s.s.",
  "..sss..",
  "sssssss",
  "..sss..",
  ".s.s.s.",
  "...s...",
];

// --- Single-flag emblems -------------------------------------------------------

/**
 * The Commonwealth Star's seven points, hand-drawn: one up, two either side
 * at the top, two out sideways and two legs. Australia.
 */
export const COMMONWEALTH_STAR = [
  "...s...",
  "s..s..s",
  ".sssss.",
  ".sssss.",
  "sssssss",
  "..sss..",
  ".s...s.",
];

/**
 * Croatia's chequy shield as 10x10 pixel rows ("r" red, "w" white): 5x5
 * squares, every one 2px, red first, the bottom row of squares tapering in to
 * a rounded point. 10 wide, so it sits half a pixel towards the hoist of the
 * middle column: equal squares win over that.
 * @returns {Rows}
 */
export const chequy = () =>
  Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 10 }, (_, x) => {
      const inset = y === 8 ? 1 : y === 9 ? 2 : 0;
      if (x < inset || x > 9 - inset) {
        return ".";
      }
      return (Math.floor(x / 2) + Math.floor(y / 2)) % 2 ? "w" : "r";
    }).join("")
  );

/**
 * A pentagram's five strokes, point up. Morocco.
 * @param {number} cx
 * @param {number} cy
 * @param {number} r Centre to each point.
 * @param {number} [stroke] Half the stroke width.
 * @returns {PixelTest}
 */
export const pentagram = (cx, cy, r, stroke = 0.55) => {
  const points = Array.from({ length: 5 }, (_, i) => [
    cx + r * Math.sin((i * 2 * Math.PI) / 5),
    cy - r * Math.cos((i * 2 * Math.PI) / 5),
  ]);
  return (x, y) =>
    points.some(
      (p, i) => segmentDistance(x, y, ...p, ...points[(i + 2) % 5]) <= stroke
    );
};

/**
 * Nepal's two pennants as pixel rows, 16 wide: the upper one comes to a
 * point at row 8, the lower, bigger one at the bottom right. One blue ("b")
 * pixel of border all the way round, crimson ("r") inside.
 * @returns {Rows}
 */
export function nepalRows() {
  const width = 16;
  const right = (y) =>
    y <= 8 ? Math.round((y * 15) / 8) : Math.round(5 + ((y - 9) * 10) / 9);
  const inside = (x, y) =>
    y >= 0 && y < INTERIOR_HEIGHT && x >= 0 && x <= right(y);
  return Array.from({ length: INTERIOR_HEIGHT }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (!inside(x, y)) return ".";
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!inside(x + dx, y + dy)) return "b";
        }
      }
      return "r";
    }).join("")
  );
}

/**
 * North Macedonia's sun over the whole interior ("y" yellow, "r" its red
 * ring). Pixel centres are measured from the centre of the middle pixel, so
 * every ray has a mirror twin both ways. Rays run to the edge midpoints and to
 * the corners, widening as they go.
 * @returns {Rows}
 */
export function macedoniaSun() {
  const corner = Math.atan2(CENTER_Y, CENTER_X);
  const rays = [
    [0, 0.15],
    [Math.PI, 0.15],
    [Math.PI / 2, 0.2],
    [-Math.PI / 2, 0.2],
    [corner, 0.13],
    [-corner, 0.13],
    [Math.PI - corner, 0.13],
    [corner - Math.PI, 0.13],
  ];
  return Array.from({ length: INTERIOR_HEIGHT }, (_, y) =>
    Array.from({ length: INTERIOR_WIDTH }, (_, x) => {
      const dx = x + 0.5 - CENTER_X;
      const dy = y + 0.5 - CENTER_Y;
      const r = Math.hypot(dx, dy);
      if (r <= 2.6) return "y";
      if (r <= 3.6) return "r";
      const angle = Math.atan2(dy, dx);
      const onRay = rays.some(([a, half]) => {
        const d = Math.abs(
          Math.atan2(Math.sin(angle - a), Math.cos(angle - a))
        );
        return d <= half;
      });
      return onRay ? "y" : ".";
    }).join("")
  );
}

/**
 * Rwanda's sun as 9x9 "y" rows: a disc, a gap, and alternating rays around it.
 * @returns {Rows}
 */
export function rwandaSun() {
  return Array.from({ length: 9 }, (_, y) =>
    Array.from({ length: 9 }, (_, x) => {
      const dx = x - 4;
      const dy = y - 4;
      const r = Math.hypot(dx, dy);
      if (r <= 2.3) return "y";
      if (r <= 3) return ".";
      if (r > 4.6) return ".";
      // Every other cell around the ring, so the rays read as rays.
      const step = Math.round(
        ((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * 16
      );
      return step % 2 ? "." : "y";
    }).join("")
  );
}

/**
 * South Korea's taegeuk, 11px across and centred on the middle pixel: split
 * along the hoist-top → fly-bottom diagonal, red above, with the S made by two
 * lobes a quarter-diameter either side of the centre — red bulging into the
 * blue at the hoist, blue into the red at the fly.
 * @returns {Shape[]} The red half and the blue half.
 */
export function taegeuk() {
  const d = 11;
  const [cx, cy, r] = [CENTER_X, CENTER_Y, d / 2];
  const [left, top] = [MID_X - (d - 1) / 2, MID_Y - (d - 1) / 2];
  const len = Math.hypot(3, 2);
  const [ax, ay] = [3 / len, 2 / len];
  const red = [];
  const blue = [];
  discRows(d).forEach((row, dy) =>
    [...row].forEach((char, dx) => {
      if (char !== "s") {
        return;
      }
      const [x, y] = [left + dx, top + dy];
      const [px, py] = [x + 0.5 - cx, y + 0.5 - cy];
      const lobe = (sign) =>
        Math.hypot(px - sign * (r / 2) * ax, py - sign * (r / 2) * ay) < r / 2;
      const isRed = lobe(-1) || (!lobe(1) && px * 2 - py * 3 > 0);
      (isRed ? red : blue).push([x, y]);
    })
  );
  return [pixelCells(red, "#cd2e3a"), pixelCells(blue, "#0047a0")];
}

/**
 * One of South Korea's trigrams, drawn for the hoist-top corner and mirrored
 * into the others. Each bar is five cells stepping steeply up-right — square
 * to the diagonal into the taegeuk — and the bars stack 2 right and 1 down
 * that diagonal; a broken bar loses its middle cell.
 * @param {number} cx Interior pixel the trigram centres on.
 * @param {number} cy
 * @param {1 | -1} fx Mirror left-right.
 * @param {1 | -1} fy Mirror top-bottom.
 * @param {(0 | 1)[]} pattern Solid (1) or broken (0), per bar.
 * @returns {Shape}
 */
export const trigram = (cx, cy, fx, fy, pattern) => {
  const bar = [
    [-1, 2],
    [-1, 1],
    [0, 0],
    [1, -1],
    [1, -2],
  ];
  return pixelCells(
    pattern.flatMap((solid, i) =>
      bar
        .filter((_, j) => solid || j !== 2)
        .map(([x, y]) => [cx + fx * (x + (i - 1) * 2), cy + fy * (y + (i - 1))])
    ),
    BLACK
  );
};

/**
 * South Africa's Y: the column where its arms meet, a little over a third of
 * the way along on the middle line.
 */
export const SA_FORK = 11;
/** How far South Africa's green band reaches either side of the Y's line. */
export const SA_GREEN = 2.5;
/** How far South Africa's white/gold edging reaches, a pixel past the green. */
export const SA_FIMBRIATION = SA_GREEN + 1;

/**
 * Distance to the centre line of South Africa's Y.
 * @param {number} x
 * @param {number} y
 * @returns {number}
 */
export const saPall = (x, y) =>
  Math.min(
    segmentDistance(x, y, 0, 0, SA_FORK, CENTER_Y),
    segmentDistance(x, y, 0, INTERIOR_HEIGHT, SA_FORK, CENTER_Y),
    x >= SA_FORK ? Math.abs(y - CENTER_Y) : Infinity
  );

/**
 * Inside the hoist triangle South Africa's Y's arms enclose.
 * @type {PixelTest}
 */
export const saInFork = (x, y) =>
  x < SA_FORK * (1 - Math.abs(y - CENTER_Y) / CENTER_Y);

/**
 * The Isle of Man's three armoured legs running clockwise round the cloth's
 * centre, with gold spurs. Each leg is a curve out from the middle whose
 * heading turns as it goes — thigh, a rounded knee, then shin — so the three
 * read as a spiral, rasterised from one leg rotated by exact thirds.
 * @param {object} [options]
 * @param {number} [options.turn] The first leg's starting heading, radians
 *   clockwise from straight up.
 * @param {number} [options.thickness] Half a leg's width.
 * @param {number} [options.steps] Segments per leg.
 * @param {number} [options.step] Each segment's length.
 * @param {number} [options.bend] Radians the heading turns per segment.
 * @returns {Shape[]} The legs, then the spurs.
 */
export function triskelion({
  turn = 0.3,
  thickness = 1.05,
  steps = 7,
  step = 1.15,
  bend = 0.28,
} = {}) {
  const legs = [];
  const spurs = [];
  for (let k = 0; k < 3; k++) {
    let heading = -Math.PI / 2 + turn + (k * 2 * Math.PI) / 3;
    let [x, y] = [CENTER_X, CENTER_Y];
    const path = [[x, y]];
    // Step out with a steady turn, so the leg is an arc rather than a hook.
    for (let i = 0; i < steps; i++) {
      heading += bend;
      x += step * Math.cos(heading);
      y += step * Math.sin(heading);
      path.push([x, y]);
    }
    legs.push(
      ...cellsWhere((px, py) =>
        path
          .slice(1)
          .some(
            ([bx, by], i) =>
              segmentDistance(px, py, ...path[i], bx, by) <= thickness
          )
      )
    );
    spurs.push(...cellsWhere((px, py) => Math.hypot(px - x, py - y) <= 1));
  }
  return [pixelCells(legs, WHITE), pixelCells(spurs, "#f9dd16")];
}

/**
 * Hong Kong's bauhinia: five white petals turned by exact fifths round the
 * cloth's centre. Each petal is a comma — a round head with a tail that bends
 * the same way as it reaches the middle — built from three discs, and a pixel
 * touching the next petal is left red so every petal stands apart. Each one
 * carries a red stamen mark in its head.
 * @returns {Shape[]} The petals, then the stamens.
 */
export function bauhinia() {
  // Head, neck, tail: [x, y, radius] for the petal pointing straight up.
  const discs = [
    [-0.3, -4.3, 2.2],
    [1.3, -2.5, 1.3],
    [2.0, -1.0, 0.8],
  ];
  const turns = Array.from({ length: 5 }, (_, k) => (k * 2 * Math.PI) / 5);
  const rotate = ([x, y], t) => [
    x * Math.cos(t) - y * Math.sin(t),
    x * Math.sin(t) + y * Math.cos(t),
  ];
  const owner = new Map();
  for (const [x, y] of cellsWhere(() => true)) {
    const [px, py] = [x + 0.5 - CENTER_X, y + 0.5 - CENTER_Y];
    const hits = turns.flatMap((t, k) =>
      discs.some(([dx, dy, r]) => {
        const [cx, cy] = rotate([dx, dy], t);
        return Math.hypot(px - cx, py - cy) <= r;
      })
        ? [k]
        : []
    );
    if (hits.length === 1) {
      owner.set(`${x},${y}`, hits[0]);
    }
  }
  const petals = [...owner]
    .filter(([key, k]) => {
      const [x, y] = key.split(",").map(Number);
      return ![
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => owner.get(`${x + dx},${y + dy}`) === (k + 1) % 5);
    })
    .map(([key]) => key.split(",").map(Number));
  const stamens = turns.map((t) => {
    const [sx, sy] = rotate([0.2, -3.9], t);
    return [Math.floor(CENTER_X + sx), Math.floor(CENTER_Y + sy)];
  });
  return [pixelCells(petals, WHITE), pixelCells(stamens, "#de2910")];
}

/** The top and bottom rows of Tokelau's sail, its point at the top. */
export const [SAIL_TOP, SAIL_BASE] = [1, 15];

/**
 * Guernsey's gold cross is equal-armed: each arm reaches this far from the
 * middle, as far as the vertical one does, a pixel short of the top and
 * bottom.
 */
export const ARM = MID_Y - 1;
