// Lithuania → Saint Lucia.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  CENTER_X,
  INTERIOR_HEIGHT,
  INTERIOR_WIDTH,
  MID_X,
  MID_Y,
  UK_BLUE,
  WHITE,
  band,
  cellsWhere,
  ensign,
  fill,
  hstripes,
  nordicCross,
  pixelCells,
  pixelCrescent,
  pixelDisc,
  pixelRect,
  pixelRing,
  pixelStar,
  pixels,
  poly,
  rect,
  vstripes,
} from "../draw.mjs";
import {
  EIGHT_RAY_SUN,
  GOLD,
  SMALL_SUN,
  macedoniaSun,
  mirroredAbout,
  nepalRows,
  pentagram,
  rwandaSun,
  triangle,
} from "../helpers.mjs";

export const flags = {
  lithuania: { layers: hstripes(["#fdb913", "#006a44", "#c1272d"]) },
  luxembourg: { layers: hstripes(["#ea141d", WHITE, "#00a2e1"]) },
  madagascar: {
    // In whole pixels, so the hoist stripe doesn't step into the green.
    layers: [
      fill(WHITE),
      pixelRect(10, 0, INTERIOR_WIDTH - 10, 9, "#fc3d32"),
      pixelRect(10, 9, INTERIOR_WIDTH - 10, 10, "#007e3a"),
    ],
  },
  malawi: {
    layers: [
      hstripes([BLACK, "#ce1126", "#339e35"]),
      // The rising sun, its lower half the red stripe, with rays fanning all
      // the way round from horizon to horizon. Symmetric about column 14.
      pixels(
        MID_X - 7,
        0,
        [
          ".......r.......",
          "...r...r...r...",
          "....r.....r....",
          ".r...rrrrr...r.",
          "..r.rrrrrrr.r..",
          "r...rrrrrrr...r",
        ],
        { r: "#ce1126" }
      ),
    ],
  },
  malaysia: {
    layers: [
      // Fourteen stripes don't divide into 19 rows, so (as on the US flag)
      // one stripe per row keeps them all the same width.
      hstripes(
        Array.from({ length: INTERIOR_HEIGHT }, (_, i) =>
          i % 2 ? WHITE : "#cc0001"
        )
      ),
      // The canton runs to the middle column and down 11 rows, ending on a
      // red stripe like the real one's eighth.
      pixelRect(0, 0, MID_X + 1, 11, "#010066"),
      pixelCrescent(1, 1, 9, "#ffcc00"),
      // The fourteen-pointed star, as a symmetric burst, a pixel clear of
      // the canton's edges.
      pixels(
        7,
        2,
        [
          "..y.y..",
          "y.yyy.y",
          ".yyyyy.",
          "yyyyyyy",
          ".yyyyy.",
          "y.yyy.y",
          "..y.y..",
        ],
        { y: "#ffcc00" }
      ),
    ],
  },
  maldives: {
    layers: [
      fill("#d21034"),
      pixelRect(MID_X - 7, MID_Y - 5, 15, 11, "#007e3a"),
      // Horns to the fly, its box nudged that way so the moon sits centred.
      pixelCrescent(MID_X - 3, MID_Y - 4, 9, WHITE),
    ],
  },
  mali: { layers: vstripes(["#14b53a", GOLD, "#ce1126"]) },
  malta: {
    layers: [
      vstripes([WHITE, "#cf142b"]),
      // The George Cross, in grey.
      pixels(1, 1, [".g.", "ggg", ".g."], { g: "#a0a0a0" }),
    ],
  },
  "marshall-islands": {
    layers: [
      fill("#003893"),
      poly(
        [
          [0, 19],
          [0, 18],
          [30, -1],
          [30, 4],
        ],
        "#dd7500"
      ),
      poly(
        [
          [0, 20],
          [0, 19],
          [30, 4],
          [30, 9],
        ],
        WHITE
      ),
      // The 24-pointed star: long rays on the axes and diagonals around a
      // round core, as a hand-placed burst.
      pixels(
        1,
        0,
        [
          "....s....",
          ".s..s..s.",
          "..sssss..",
          ".sssssss.",
          "sssssssss",
          ".sssssss.",
          "..sssss..",
          ".s..s..s.",
          "....s....",
        ],
        { s: WHITE }
      ),
    ],
  },
  mauritania: {
    layers: [
      hstripes(["#d01c1f", "#00a95c", "#d01c1f"], [1, 3, 1]),
      pixelCrescent(MID_X - 5, 2, 11, "#ffd700", { facing: "up", bite: 0.9 }),
      pixelStar(MID_X - 1, 5, "#ffd700", 3),
    ],
  },
  mauritius: {
    layers: hstripes(["#eb2436", "#1a206d", "#ffd500", "#00a551"]),
  },
  mexico: {
    layers: [
      vstripes(["#006847", WHITE, "#ce1126"]),
      // The eagle on the cactus, over a wreath, centred on the white.
      pixels(
        MID_X - 3,
        MID_Y - 4,
        [
          "...b...",
          "..bbb..",
          ".bbbbb.",
          "bb.b.bb",
          "...b...",
          "..g.g..",
          ".ggggg.",
          "l..g..l",
          ".lllll.",
        ],
        { b: "#8c5a2b", g: "#3f8f3f", l: "#1f6e37" }
      ),
    ],
  },
  micronesia: {
    // Four identical 3px stars in a diamond around the middle pixel.
    layers: [
      fill("#75b2dd"),
      pixelStar(MID_X - 1, MID_Y - 7, WHITE, 3),
      pixelStar(MID_X - 1, MID_Y + 5, WHITE, 3),
      pixelStar(MID_X - 7, MID_Y - 1, WHITE, 3),
      pixelStar(MID_X + 5, MID_Y - 1, WHITE, 3),
    ],
  },
  moldova: {
    layers: [
      vstripes(["#0046ae", "#ffd200", "#cc092f"]),
      // The eagle holding a shield, as a brown bird over a red-and-blue crest.
      pixels(
        MID_X - 3,
        MID_Y - 3,
        [".bbbbb.", "bbbbbbb", ".brrrb.", ".brrrb.", "..bbb..", "..bbb.."],
        {
          b: "#9c6b2f",
          r: "#cc092f",
        }
      ),
    ],
  },
  monaco: { layers: hstripes(["#ce1126", WHITE]) },
  mongolia: {
    layers: [
      vstripes(["#c4272f", "#015197", "#c4272f"]),
      // The Soyombo: flame, sun, moon, then the bars and yin-yang.
      // Six wide, so it centres in the hoist stripe's ten columns.
      pixels(
        2,
        MID_Y - 6,
        [
          "..yy..",
          ".yyyy.",
          "..yy..",
          ".yyyy.",
          "y....y",
          ".yyyy.",
          "yyyyyy",
          "y....y",
          "y.yy.y",
          "y....y",
          "yyyyyy",
          "y....y",
          "yyyyyy",
        ],
        { y: "#f9cf02" }
      ),
    ],
  },
  montenegro: {
    layers: [
      fill("#d4af37"),
      rect(1.2, 1.2, 27.6, 17.6, "#c40308"),
      // The crowned double-headed eagle, wings raised, centred on the red,
      // with its blue-and-green shield on its chest.
      pixels(
        MID_X - 6,
        MID_Y - 4,
        [
          "y....yyy....y",
          "yy..y...y..yy",
          "yyy.yyyyy.yyy",
          "yyyyyyyyyyyyy",
          ".yyyybbbyyyy.",
          "..yyybbbyyy..",
          "....ybgby....",
          "....yyyyy....",
          "...yy...yy...",
        ],
        { y: "#d4af37", b: "#1d5e91", g: "#6d8c3e" }
      ),
    ],
  },
  morocco: {
    layers: [
      fill("#c1272d"),
      // The interlaced pentagram: five strokes, folded about the middle
      // column so both halves match.
      pixelCells(
        cellsWhere(mirroredAbout(CENTER_X, pentagram(CENTER_X, 10, 5.6))),
        "#006233"
      ),
    ],
  },
  mozambique: {
    layers: [
      hstripes(["#007168", WHITE, BLACK, WHITE, "#fce100"], [6, 1, 6, 1, 6]),
      poly(
        [
          [0, 0],
          [14, 10],
          [0, 20],
        ],
        "#d21034"
      ),
      pixelStar(1, 6, "#fce100", 7),
      // The rifle and hoe crossed over the open book.
      pixels(2, 8, ["k...k", ".kwk.", "..k..", ".k.k."], {
        k: BLACK,
        w: WHITE,
      }),
    ],
  },
  myanmar: {
    layers: [
      hstripes(["#fecb00", "#34b233", "#ea2839"]),
      // Hand-drawn rather than pixelStar(13): thin arm tips and a narrow
      // waist, so the star reads slim like the real one.
      pixels(
        MID_X - 6,
        3,
        [
          "......s......",
          "......s......",
          ".....sss.....",
          ".....sss.....",
          "sssssssssssss",
          ".sssssssssss.",
          "...sssssss...",
          "....sssss....",
          "...sssssss...",
          "...sss.sss...",
          "..ss.....ss..",
          "..s.......s..",
        ],
        { s: WHITE }
      ),
    ],
  },
  namibia: {
    layers: [
      fill("#003580"),
      poly(
        [
          [30, 0],
          [30, 20],
          [0, 20],
        ],
        "#009543"
      ),
      band(0, 20, 30, 0, 7.5, WHITE),
      band(0, 20, 30, 0, 5.5, "#d21034"),
      pixelDisc(3, 2, 5, "#ffce00"),
    ],
  },
  nauru: {
    layers: [
      fill("#002b7f"),
      rect(0, 9.3, 30, 1.4, "#ffc61e"),
      // The twelve-pointed star, as a small symmetric burst.
      pixels(5, 11, SMALL_SUN, { s: WHITE }),
    ],
  },
  nepal: {
    // Drawn upright at its real proportions (taller than wide) instead of
    // stretched across the cloth: the two pennants fill the hoist side and
    // the rest of the cloth is left empty, so the outline follows them.
    layers: [
      pixels(0, 0, nepalRows(), { b: "#003893", r: "#dc143c" }),
      // The moon: a crescent, horns up, cupping a half-sun whose rays
      // fan up between the horns. Low in the upper pennant, where it's wide
      // enough for all seven columns.
      pixels(1, 4, ["...w...", "w.w.w.w", "w.www.w", ".wwwww."], { w: WHITE }),
      // The twelve-rayed sun.
      pixels(2, 12, SMALL_SUN, { s: WHITE }),
    ],
  },
  netherlands: { layers: hstripes(["#ae1c28", WHITE, "#21468b"]) },
  "new-zealand": {
    layers: ensign(
      UK_BLUE,
      // The Southern Cross: four small red stars laid out as the
      // constellation in the fly. (A white edge, as on the real ones, just
      // turns a 3px star into a snowflake.)
      ...[
        [21, 1],
        [17, 6],
        [24, 5],
        [21, 13],
      ].map(([x, y]) => pixelStar(x - 1, y - 1, "#c8102e", 3))
    ),
  },
  nicaragua: {
    layers: [
      hstripes(["#0067c6", WHITE, "#0067c6"]),
      // The triangle of the coat of arms, centred on the white stripe.
      pixels(MID_X - 2, MID_Y - 1, ["..g..", ".gbg.", "ggggg"], {
        g: "#c8a640",
        b: "#0067c6",
      }),
    ],
  },
  niger: {
    layers: [
      hstripes(["#e05206", WHITE, "#0db02b"]),
      pixelDisc(MID_X - 2, MID_Y - 2, 5, "#e05206"),
    ],
  },
  nigeria: { layers: vstripes(["#008751", WHITE, "#008751"]) },
  "north-korea": {
    layers: [
      hstripes(
        ["#024fa2", WHITE, "#ed1c27", WHITE, "#024fa2"],
        [6, 1, 15, 1, 6]
      ),
      // A round white disc with a symmetric red star centred in it.
      pixelDisc(6, 6, 7, WHITE),
      // Legs tucked in rather than pixelStar(5)'s splayed ones, which would
      // poke out of the disc and vanish into the red.
      pixels(7, 7, ["..s..", "..s..", "sssss", ".sss.", ".s.s."], {
        s: "#ed1c27",
      }),
    ],
  },
  "north-macedonia": {
    // The sun and its eight rays, computed per pixel about the cloth's exact
    // centre so it's symmetric both ways.
    layers: [
      fill("#d20000"),
      pixels(0, 0, macedoniaSun(), { y: "#ffe600", r: "#d20000" }),
    ],
  },
  norway: {
    layers: [
      fill("#ba0c2f"),
      // 6 : 1 : 2 : 1 : 12 across, so the blue sits on column 9.
      nordicCross(8, MID_Y - 1, [
        [5, WHITE],
        [3, "#00205b"],
      ]),
    ],
  },
  oman: {
    layers: [
      fill("#db161b"),
      rect(8, 0, 22, 6.67, WHITE),
      rect(8, 13.33, 22, 6.67, "#008000"),
      // The khanjar and crossed swords.
      pixels(1, 1, ["w.w.w", ".www.", "..w..", ".w.w."], { w: WHITE }),
    ],
  },
  pakistan: {
    layers: [
      fill("#01411c"),
      rect(0, 0, 7.5, 20, WHITE),
      // The crescent opens to the upper fly, its star in the mouth.
      pixelCells(
        cellsWhere(
          (x, y) =>
            (x - 17.9) ** 2 + (y - 10) ** 2 <= 5.4 ** 2 &&
            (x - 19.6) ** 2 + (y - 8.6) ** 2 > 4.2 ** 2
        ),
        WHITE
      ),
      pixelStar(20, 5, WHITE, 3),
    ],
  },
  palau: {
    // The moon sits a little towards the hoist.
    layers: [fill("#4aadd6"), pixelDisc(7, MID_Y - 5, 11, "#ffde00")],
  },
  palestine: {
    layers: [
      hstripes([BLACK, WHITE, "#007a3d"]),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        "#ce1126"
      ),
    ],
  },
  panama: {
    // Quarters in whole pixels, split on the middle column, and the same
    // 7px star in each white one: the two sit point-symmetric about the
    // cloth's middle pixel.
    layers: [
      fill(WHITE),
      pixelRect(MID_X + 1, 0, INTERIOR_WIDTH - MID_X - 1, MID_Y, "#da121a"),
      pixelRect(0, MID_Y, MID_X + 1, INTERIOR_HEIGHT - MID_Y, "#072357"),
      pixelStar(MID_X - 10, MID_Y - 8, "#072357", 7),
      pixelStar(MID_X + 4, MID_Y + 2, "#da121a", 7),
    ],
  },
  "papua-new-guinea": {
    layers: [
      poly(
        [
          [0, 0],
          [30, 0],
          [30, 20],
        ],
        "#ce1126"
      ),
      poly(
        [
          [0, 0],
          [30, 20],
          [0, 20],
        ],
        BLACK
      ),
      // The Southern Cross: four twinkles in a kite, plus the small one.
      pixelStar(6, 7, WHITE, 3),
      pixelStar(2, 11, WHITE, 3),
      pixelStar(9, 10, WHITE, 3),
      pixelStar(6, 15, WHITE, 3),
      pixels(9, 14, ["w"], { w: WHITE }),
      // The bird of paradise, tail trailing off to the fly.
      pixels(
        16,
        3,
        ["..yy.....", ".yyyy....", "yy.yyy...", ".....yyy.", "......y.y"],
        { y: GOLD }
      ),
    ],
  },
  paraguay: {
    layers: [
      hstripes(["#d52b1e", WHITE, "#0038a8"]),
      pixelRing(MID_X - 2, MID_Y - 2, 5, 1, "#3a7d2e"),
      pixels(MID_X, MID_Y, ["y"], { y: "#ffd900" }),
    ],
  },
  peru: { layers: vstripes(["#d91023", WHITE, "#d91023"]) },
  philippines: {
    layers: [
      hstripes(["#0038a8", "#ce1126"]),
      poly(
        [
          [0, 0],
          [17.3, 10],
          [0, 20],
        ],
        WHITE
      ),
      // The eight-rayed sun, and a star in each corner of the triangle.
      pixels(2, 6, EIGHT_RAY_SUN, { s: GOLD }),
      pixelStar(1, 2, GOLD, 3),
      pixelStar(1, 14, GOLD, 3),
      pixelStar(11, 8, GOLD, 3),
    ],
  },
  poland: { layers: [hstripes([WHITE, "#dc143c"])] },
  portugal: {
    layers: [
      vstripes(["#006600", "#ff0000"], [2, 3]),
      // The armillary sphere, with the shield centred on it: red border,
      // white inside, the five blue quinas as a cross.
      pixelDisc(7, 5, 9, "#ffcc00"),
      // 5x5, so it sits dead centre in the 9px sphere: two rows of gold above
      // and below, two columns either side.
      pixels(9, 7, ["rrrrr", "rwbwr", "rbbbr", "rwbwr", ".rrr."], {
        r: "#ff0000",
        w: WHITE,
        b: "#003399",
      }),
    ],
  },
  qatar: {
    // Nine identical points: one pixel row each, two pixels into the
    // maroon, with a plain row between and at either end.
    layers: [
      fill("#8a1538"),
      pixels(
        0,
        0,
        Array.from({ length: 19 }, (_, y) => "w".repeat(y % 2 ? 10 : 8)),
        { w: WHITE }
      ),
    ],
  },
  romania: { layers: vstripes(["#002b7f", GOLD, "#ce1126"]) },
  russia: { layers: hstripes([WHITE, "#0039a6", "#d52b1e"]) },
  rwanda: {
    layers: [
      hstripes(["#00a1de", "#fad201", "#20603d"], [2, 1, 1]),
      // A round sun: a disc, a ring of blue, then rays all the way round.
      pixels(INTERIOR_WIDTH - 10, 0, rwandaSun(), { y: "#e5be01" }),
    ],
  },
  "saint-kitts-and-nevis": {
    layers: [
      fill("#009e49"),
      poly(
        [
          [30, 0],
          [30, 20],
          [0, 20],
        ],
        "#ce1126"
      ),
      band(0, 20, 30, 0, 8.5, GOLD),
      band(0, 20, 30, 0, 6, BLACK),
      // Two identical stars on the band, placed point-symmetric about the
      // cloth's middle pixel.
      pixelStar(MID_X - 6, MID_Y + 2, WHITE, 3),
      pixelStar(MID_X + 4, MID_Y - 4, WHITE, 3),
    ],
  },
  "saint-lucia": {
    // Three triangles on the middle column, so each is exactly symmetric.
    layers: [
      fill("#66ccff"),
      pixelCells(cellsWhere(triangle(2, 17.1, 6.9)), WHITE),
      pixelCells(cellsWhere(triangle(4.3, 17.1, 4.8)), BLACK),
      pixelCells(cellsWhere(triangle(11, 17.1, 6.3)), GOLD),
    ],
  },
};
