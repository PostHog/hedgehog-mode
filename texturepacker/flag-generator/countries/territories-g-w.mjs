// Territories with their own flags, Guernsey → Wallis and Futuna. See ../draw.mjs for the DSL.
import {
  BLACK,
  UK_BLUE,
  WHITE,
  band,
  box,
  circle,
  cross,
  ensign,
  fill,
  hstripes,
  pixelStar,
  pixels,
  poly,
  rect,
  ring,
  saltire,
  star,
  vstripes,
} from "../draw.mjs";

// Three armoured legs running clockwise around (cx, cy), with gold spurs.
const triskelion = (cx, cy) =>
  [0, 1, 2].flatMap((k) => {
    const thigh = -Math.PI / 2 + (k * 2 * Math.PI) / 3;
    const shin = thigh + Math.PI / 2;
    const kx = cx + 4.6 * Math.cos(thigh);
    const ky = cy + 4.6 * Math.sin(thigh);
    const fx = kx + 3.6 * Math.cos(shin);
    const fy = ky + 3.6 * Math.sin(shin);
    return [
      band(cx, cy, kx, ky, 1.7, WHITE, 3),
      band(kx, ky, fx, fy, 1.7, WHITE, 3),
      circle(fx, fy, 0.9, "#f9dd16", 3),
    ];
  });

export const flags = {
  guernsey: {
    layers: [
      fill(WHITE),
      cross(15, 10, 5, "#e8112d"),
      cross(15, 10, 2, "#f9dd16"),
    ],
  },
  "hong-kong": {
    layers: [
      fill("#de2910"),
      // The bauhinia: five white petals in a pinwheel.
      pixels(
        9,
        4,
        [
          "....ww....",
          "....www...",
          ".ww.ww..w.",
          "www..w.ww.",
          ".wwww.www.",
          "..ww.wwww.",
          ".www.ww...",
          ".ww..ww...",
          "....www...",
          "....ww....",
        ],
        { w: WHITE }
      ),
    ],
  },
  "isle-of-man": {
    layers: [fill("#cf142b"), ...triskelion(15, 10)],
  },
  jersey: {
    layers: [
      fill(WHITE),
      saltire(3.5, "#df112d"),
      // The badge: a red shield with gold lions, under a gold crown.
      pixels(
        12,
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
      // Five gold stars in an arc, a white lotus, a bridge and water.
      pixels(8, 2, ["....y...", ".y.....y", "y......."], { y: "#fbd116" }),
      pixels(19, 3, ["y"], { y: "#fbd116" }),
      pixels(
        10,
        6,
        [
          "....w....",
          "...www...",
          ".w.www.w.",
          ".ww.w.ww.",
          "..wwwww..",
          "wwwwwwwww",
          "..........",
          ".wwwwwww.",
          "..........",
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
        18,
        5,
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
      // Yellow stars on the Union Jack, the middle one on a blue disc.
      circle(7.5, 5, 2, UK_BLUE, 3),
      pixels(
        0,
        0,
        ["", "", "", "...y...........", "", "...........y...", "", "", ""],
        { y: "#fedd00" }
      ),
      pixels(6, 4, [".y.", "yyy", ".y."], { y: "#fedd00" }),
      pixels(6, 1, ["y"], { y: "#fedd00" }),
      pixels(6, 7, ["y"], { y: "#fedd00" })
    ),
  },
  "norfolk-island": {
    layers: [
      ...vstripes(["#007934", WHITE, "#007934"], [7, 9, 7]),
      // The Norfolk Island pine.
      pixels(
        11,
        2,
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
      ring(15, 10, 7.5, 1.4, "#e8a33c", 2),
      pixels(
        10,
        4,
        [".r..r...r.", "", "", "", "", "", "", "", "", ".r...r..r."],
        {
          r: "#d2232a",
        }
      ),
      star(15, 7.5, 3.4, WHITE),
      rect(13.6, 10.5, 2.8, 5, "#9a9a9a", 2),
      rect(12.3, 10.2, 5.4, 1.4, "#9a9a9a", 2),
    ],
  },
  "pitcairn-islands": {
    layers: ensign(
      UK_BLUE,
      // The arms: green over yellow over blue, with an anchor and a Bible.
      pixels(
        18,
        4,
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
      star(4.6, 10, 2.8, WHITE),
    ],
  },
  "saint-helena": {
    layers: ensign(
      UK_BLUE,
      // The arms: a wirebird on yellow above a ship on the sea.
      pixels(
        18,
        4,
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
      pixels(2, 6, [".yyy.", "ooooo", "obwbo", "obbbo", ".ooo."], {
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
        17,
        4,
        [
          "....y....",
          "..wwwww..",
          "n.wyyyw.k",
          "nnwbwbwkk",
          "nnwwbwwkw",
          "n.wbwbw.k",
          "...www...",
          "....w....",
        ],
        { w: WHITE, y: "#f9dd16", b: "#55a5dc", n: "#8a6a4a", k: BLACK }
      )
    ),
  },
  tokelau: {
    layers: [
      fill("#00247d"),
      // A gold outrigger canoe under the Southern Cross.
      poly(
        [
          [6, 14],
          [27, 9],
          [26, 12],
          [10, 17],
        ],
        "#fed100"
      ),
      poly(
        [
          [16, 4],
          [17, 11],
          [12, 12],
        ],
        "#fed100"
      ),
      pixelStar(2, 2, WHITE, 4),
      pixelStar(3, 11, WHITE, 4),
      pixels(7, 6, [".w.", "www", ".w."], { w: WHITE }),
      pixels(0, 7, [".w.", "www", ".w."], { w: WHITE }),
    ],
  },
  "turks-and-caicos-islands": {
    layers: ensign(
      UK_BLUE,
      // The arms: a yellow shield with a conch, a lobster and a cactus.
      pixels(
        18,
        4,
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
        8,
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
      rect(0, 0, 11, 7.5, WHITE),
      box(0, 0, 10, 6.6, vstripes(["#002395", WHITE, "#ed2939"])),
      // Four white triangles whose tips meet in the middle: a saltire.
      ...[
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([dx, dy]) =>
        poly(
          [
            [22, 11],
            [22 + dx * 6, 11 + dy * 2.2],
            [22 + dx * 3.2, 11 + dy * 5.5],
          ],
          WHITE
        )
      ),
    ],
  },
};
