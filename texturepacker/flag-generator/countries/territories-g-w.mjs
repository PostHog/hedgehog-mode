// Territories with their own flags, Guernsey → Wallis and Futuna.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  FLY_MID,
  INTERIOR_HEIGHT,
  MID_X,
  MID_Y,
  UK_BLUE,
  WHITE,
  cellsWhere,
  ensign,
  fill,
  hstripes,
  pixelCells,
  pixelCross,
  pixelDisc,
  pixelRect,
  pixelRing,
  pixelStar,
  pixels,
  poly,
  saltire,
  vstripes,
} from "../draw.mjs";
import { ARM, SAIL_BASE, SAIL_TOP, bauhinia, triskelion } from "../helpers.mjs";

export const flags = {
  guernsey: {
    layers: [
      fill(WHITE),
      pixelCross(MID_X - 2, MID_Y - 2, 5, "#e8112d"),
      // The gold Norman cross, on the middle column and row: equal 1px arms
      // stopping a pixel short of the top and bottom edges, so the
      // horizontal one stays well inside the red, each widening to 3px.
      pixelRect(MID_X, 1, 1, INTERIOR_HEIGHT - 2, "#f9dd16"),
      pixelRect(MID_X - ARM, MID_Y, 2 * ARM + 1, 1, "#f9dd16"),
      pixelRect(MID_X - 1, 1, 3, 1, "#f9dd16"),
      pixelRect(MID_X - 1, INTERIOR_HEIGHT - 2, 3, 1, "#f9dd16"),
      pixelRect(MID_X - ARM, MID_Y - 1, 1, 3, "#f9dd16"),
      pixelRect(MID_X + ARM, MID_Y - 1, 1, 3, "#f9dd16"),
    ],
  },
  "hong-kong": {
    layers: [fill("#de2910"), ...bauhinia()],
  },
  "isle-of-man": {
    layers: [fill("#cf142b"), ...triskelion()],
  },
  jersey: {
    layers: [
      fill(WHITE),
      saltire(3.5, "#df112d"),
      // The badge: a red shield with gold lions, under a gold crown.
      pixels(
        MID_X - 2,
        1,
        [".y.y.", "yyyyy", "rrrrr", "ryyyr", "rrrrr", "ryyyr", ".rrr."],
        {
          y: "#f9dd16",
          r: "#df112d",
        }
      ),
    ],
  },
  macau: {
    layers: [
      fill("#00785e"),
      // Five gold stars in an arc over the lotus, mirrored about the middle
      // column: a big one, two small either side.
      pixelStar(MID_X - 2, 1, "#fbd116", 4),
      ...[-5, 5, -9, 9].map((dx, i) =>
        pixelStar(MID_X + dx - 1, i < 2 ? 2 : 4, "#fbd116", 3)
      ),
      pixels(
        MID_X - 4,
        6,
        [
          "....w....",
          "...www...",
          ".w.www.w.",
          ".ww.w.ww.",
          "..wwwww..",
          "wwwwwwwww",
          ".........",
          ".wwwwwww.",
          ".........",
          "..wwwww..",
        ],
        { w: WHITE }
      ),
    ],
  },
  montserrat: {
    layers: ensign(
      UK_BLUE,
      // The badge: a woman with a harp and a cross, on a blue-and-brown shield.
      pixels(
        FLY_MID - 3,
        MID_Y - 3,
        [
          "wwwwwww",
          "wbbbbbw",
          "wbgwbbw",
          "wbgyrbw",
          "wnngnnw",
          ".wnnnw.",
          "..www..",
        ],
        {
          w: WHITE,
          b: "#55a5dc",
          g: "#3a7d2c",
          y: "#f9dd16",
          r: "#c8102e",
          n: "#7b4a1e",
        }
      )
    ),
  },
  niue: {
    layers: ensign(
      "#fedd00",
      // On the Union Jack: the big star on a blue disc where the crosses
      // meet (the canton's middle pixel, (7, 5)), and a small one on each
      // arm of St George's cross.
      pixelDisc(5, 3, 5, UK_BLUE),
      pixelStar(6, 4, "#fedd00", 3),
      pixelCells(
        [
          [7, 1],
          [7, 9],
          [2, 5],
          [12, 5],
        ],
        "#fedd00"
      )
    ),
  },
  "norfolk-island": {
    layers: [
      ...vstripes(["#007934", WHITE, "#007934"], [7, 9, 7]),
      // The Norfolk Island pine.
      // 15 rows, centred on the middle pixel.
      pixels(
        MID_X - 3,
        MID_Y - 7,
        [
          "...g...",
          "..ggg..",
          "...g...",
          ".ggggg.",
          "...g...",
          "..ggg..",
          "ggggggg",
          "...g...",
          ".ggggg.",
          "ggggggg",
          "...g...",
          "...g...",
          "...g...",
          "...g...",
          "..ggg..",
        ],
        { g: "#007934" }
      ),
    ],
  },
  "northern-mariana-islands": {
    layers: [
      fill("#0071bc"),
      // A wreath of flowers around a white star over a grey latte stone.
      pixelRing(MID_X - 7, MID_Y - 7, 15, 2, "#e8a33c"),
      // Flowers in the wreath: on its top, bottom and sides and four
      // diagonals, mirrored about the middle column and row.
      pixelCells(
        [
          [0, -7],
          [0, 7],
          [-7, 0],
          [7, 0],
          [-5, -5],
          [5, -5],
          [-5, 5],
          [5, 5],
        ].map(([dx, dy]) => [MID_X + dx, MID_Y + dy]),
        "#d2232a"
      ),
      // The latte stone: a 3px pillar under a 5px capstone, on the middle
      // column, with the star centred on the middle pixel in front of it.
      pixelRect(MID_X - 2, MID_Y + 2, 5, 1, "#9a9a9a"),
      pixelRect(MID_X - 1, MID_Y + 3, 3, 3, "#9a9a9a"),
      pixelStar(MID_X - 3, MID_Y - 3, WHITE, 7),
    ],
  },
  "pitcairn-islands": {
    layers: ensign(
      UK_BLUE,
      // The arms: green over yellow over blue, with an anchor and a Bible.
      pixels(
        FLY_MID - 3,
        MID_Y - 4,
        [
          "...g...",
          "..ggg..",
          "wwwwwww",
          "wgggggw",
          "wgyyygw",
          "wyyyyyw",
          "wbbbbbw",
          ".wbbbw.",
          "..www..",
        ],
        { w: WHITE, g: "#3a7d2c", y: "#f9dd16", b: "#55a5dc" }
      )
    ),
  },
  "puerto-rico": {
    layers: [
      ...hstripes(["#ed0000", WHITE, "#ed0000", WHITE, "#ed0000"]),
      poly(
        [
          [0, 0],
          [13, 10],
          [0, 20],
        ],
        "#0050f0"
      ),
      // At the triangle's centroid (pixel column 4), centred on row 9.
      pixelStar(2, 7, WHITE, 5),
    ],
  },
  "saint-helena": {
    layers: ensign(
      UK_BLUE,
      // The arms: a wirebird on yellow above a ship on the sea.
      pixels(
        FLY_MID - 3,
        MID_Y - 4,
        [
          "wwwwwww",
          "wyynyyw",
          "wyyyyyw",
          "wbbwbbw",
          "wbwwwbw",
          "wbnnnbw",
          "wbbbbbw",
          ".wbbbw.",
          "..www..",
        ],
        { w: WHITE, y: "#f9dd16", n: "#5a3a1e", b: "#55a5dc" }
      )
    ),
  },
  "sint-maarten": {
    layers: [
      ...hstripes(["#dc171d", "#012a87"]),
      poly(
        [
          [0, 0],
          [14, 10],
          [0, 20],
        ],
        WHITE
      ),
      // The arms: an orange-bordered blue shield under a gold sun.
      pixels(2, MID_Y - 2, [".yyy.", "ooooo", "obwbo", "obbbo", ".ooo."], {
        y: "#f9dd16",
        o: "#f48f20",
        b: "#55a5dc",
        w: WHITE,
      }),
    ],
  },
  "south-georgia": {
    layers: ensign(
      UK_BLUE,
      // The arms: a gold lion on a blue-and-white shield, flanked by a seal
      // and a penguin.
      pixels(
        FLY_MID - 4,
        MID_Y - 4,
        [
          "....y....",
          "..wwwww..",
          "n.wyyyw.k",
          "nnwbwbwkk",
          "nnwwbwwkw",
          "n.wbwbw.k",
          "...www...",
          "....w....",
          "....w....",
        ],
        { w: WHITE, y: "#f9dd16", b: "#55a5dc", n: "#8a6a4a", k: BLACK }
      )
    ),
  },
  tokelau: {
    layers: [
      fill("#00247d"),
      // The gold vaka sail: a long straight edge rising from the bottom left
      // to a point at the top right, and a back edge that curves in like the
      // inside of a crescent before sweeping out to the bottom right corner.
      pixelCells(
        cellsWhere((x, y) => {
          const t = (y - SAIL_TOP) / (SAIL_BASE - SAIL_TOP);
          if (t < 0 || t > 1) {
            return false;
          }
          const front = 24.5 - 18.5 * t;
          const back = 24.5 - 3.5 * Math.sin(Math.PI * t) + 4 * t ** 2;
          return x >= front && x <= back;
        }),
        "#fed100"
      ),
      // The hull beneath it.
      pixelRect(5, SAIL_BASE + 2, 23, 1, "#fed100"),
      // The Southern Cross on the hoist: two stars one above the other, one
      // either side.
      pixelStar(4, 1, WHITE, 3),
      pixelStar(1, 6, WHITE, 3),
      pixelStar(7, 6, WHITE, 3),
      pixelStar(4, 12, WHITE, 3),
    ],
  },
  "turks-and-caicos-islands": {
    layers: ensign(
      UK_BLUE,
      // The arms: a yellow shield with a conch, a lobster and a cactus.
      pixels(
        FLY_MID - 3,
        MID_Y - 3,
        [
          "yyyyyyy",
          "yrryyyy",
          "yrryygy",
          "yyyyggy",
          "yooyygy",
          ".yoyyy.",
          "..yyy..",
        ],
        { y: "#fed100", r: "#f2a7b2", o: "#e8711c", g: "#3a7d2c" }
      )
    ),
  },
  "us-virgin-islands": {
    layers: [
      fill(WHITE),
      // A gold eagle with the US shield on its chest, between a blue V and I.
      pixels(2, 6, ["b...b", "b...b", ".b.b.", ".b.b.", "..b.."], {
        b: "#0b3d91",
      }),
      pixels(23, 6, ["bbb", ".b.", ".b.", ".b.", "bbb"], { b: "#0b3d91" }),
      pixels(
        MID_X - 5,
        4,
        [
          "....y.y....",
          "yy..yyy..yy",
          "yyy.yyy.yyy",
          ".yyyrbryyy.",
          "..yyrwryy..",
          "....rwr....",
          "...ggyyy...",
          "..g..y..y..",
        ],
        { y: "#f9c80e", r: "#c8102e", b: "#0b3d91", w: WHITE, g: "#3a7d2c" }
      ),
    ],
  },
  "wallis-and-futuna": {
    layers: [
      fill("#ed2939"),
      // A French canton with a white border, and a white saltire of four
      // triangles in the fly.
      // Three 3px stripes in a 1px white border.
      pixelRect(0, 0, 10, 7, WHITE),
      pixelRect(0, 0, 3, 6, "#002395"),
      pixelRect(6, 0, 3, 6, "#ed2939"),
      // Four white triangles meeting in a red saltire: a 9x9 white square
      // with its two diagonals left red, clean 45° lines crossing on its
      // middle pixel, centred on the fly.
      pixels(
        FLY_MID - 4,
        MID_Y - 4,
        Array.from({ length: 9 }, (_, y) =>
          Array.from({ length: 9 }, (_, x) =>
            x === y || x === 8 - y ? "." : "w"
          ).join("")
        ),
        { w: WHITE }
      ),
    ],
  },
};
