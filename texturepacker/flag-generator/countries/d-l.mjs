// Dominican Republic → Liechtenstein.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  INTERIOR_HEIGHT,
  INTERIOR_WIDTH,
  MID_X,
  MID_Y,
  WHITE,
  band,
  circle,
  cross,
  ensign,
  fill,
  hstripes,
  mirrorHalves,
  pixelCells,
  pixelCrescent,
  pixelCross,
  pixelDisc,
  pixelHoistTriangle,
  pixelRect,
  pixelStar,
  pixels,
  poly,
  rect,
  star,
  vstripes,
} from "../draw.mjs";
import { ellipse, pixelTrace, sunTest } from "../helpers.mjs";

export const flags = {
  "dominican-republic": {
    layers: [
      fill("#002d62"),
      pixelRect(MID_X, 0, MID_X + 1, MID_Y, "#ce1126"),
      pixelRect(0, MID_Y, MID_X, MID_Y + 1, "#ce1126"),
      // 5px both ways, so the arms match and the cross is dead centre.
      pixelCross(MID_X - 2, MID_Y - 2, 5, WHITE),
      // The coat of arms, shrunk to a shield in the middle of the cross:
      // its blue and red quarters, split by the green of the laurel.
      pixels(MID_X - 1, MID_Y - 1, ["bgr", "ggg", "rgb"], {
        b: "#002d62",
        r: "#ce1126",
        g: "#00843d",
      }),
    ],
  },
  "dr-congo": {
    layers: [
      fill("#007fff"),
      band(-2, 22, 32, -2, 6, "#f7d618"),
      band(-2, 22, 32, -2, 4, "#ce1021"),
      pixelStar(2, 1, "#f7d618", 7),
    ],
  },
  ecuador: {
    layers: [
      hstripes(["#ffdd00", "#034ea2", "#ed1c24"], [2, 1, 1]),
      // The coat of arms: the condor over an oval of sky and mountain.
      // Centred on the flag, straddling the yellow and the blue.
      pixels(
        MID_X - 3,
        7,
        [".nnnnn.", "nnyyynn", ".bbbbb.", ".bgggb.", "..yyy.."],
        {
          n: "#5c3d1e",
          y: "#ffdd00",
          b: "#4f9bd9",
          g: "#3a7d2c",
        }
      ),
    ],
  },
  egypt: {
    layers: [
      hstripes(["#ce1126", WHITE, BLACK]),
      // The eagle of Saladin: head up top, wings spread down either side of
      // the shield-chested body, on its plinth. 9px wide so it centres.
      pixels(
        MID_X - 4,
        MID_Y - 3,
        [
          "....g....",
          "...ggg...",
          ".ggggggg.",
          "gg.ggg.gg",
          "gg.ggg.gg",
          "g...g...g",
          "..ggggg..",
        ],
        { g: "#c09300" }
      ),
    ],
  },
  "el-salvador": {
    layers: [
      hstripes(["#0047ab", WHITE, "#0047ab"]),
      // The coat of arms: a gold-ringed triangle in a green wreath.
      pixels(MID_X - 3, MID_Y - 1, [".gyyyg.", "gy...yg", ".gyyyg."], {
        y: "#ffcc00",
        g: "#2e8b3a",
      }),
    ],
  },
  "equatorial-guinea": {
    layers: [
      // Stripes in whole rows (6, 7 and 6, so they're symmetric) and the hoist
      // triangle in whole pixels, so no stray pixel of stripe pokes out where
      // a stripe boundary falls mid-row across the triangle's edge.
      pixelRect(0, 0, INTERIOR_WIDTH, 6, "#3e9a00"),
      pixelRect(0, 6, INTERIOR_WIDTH, 7, WHITE),
      pixelRect(0, 13, INTERIOR_WIDTH, 6, "#e32118"),
      pixelHoistTriangle(8, "#0073ce", 7 / 9),
      // The silk-cotton tree on its silver shield.
      pixels(MID_X - 2, MID_Y - 1, [".ggg.", "ggggg", "..n.."], {
        g: "#3e9a00",
        n: "#8c5a2b",
      }),
    ],
  },
  eritrea: {
    layers: [
      hstripes(["#12ad2b", "#4189dd"]),
      poly(
        [
          [0, 0],
          [30, 10],
          [0, 20],
        ],
        "#ea0437"
      ),
      // The olive wreath and branch.
      pixels(
        4,
        6,
        [".y.y.", "y.y.y", "y.y.y", "y.y.y", "y.y.y", ".yyy.", "..y.."],
        {
          y: "#ffc726",
        }
      ),
    ],
  },
  estonia: { layers: hstripes(["#0072ce", BLACK, WHITE]) },
  eswatini: {
    layers: [
      hstripes(
        ["#3e5eb9", "#ffd900", "#b10c0c", "#ffd900", "#3e5eb9"],
        [3, 1, 8, 1, 3]
      ),
      // The staff and spears behind the shield.
      rect(5, 9.5, 20, 1, "#ffd900", 2),
      // The Nguni shield: black on the hoist side, white on the fly side.
      ellipse(15, 10, 6.5, 3.4, BLACK, 2),
      poly(
        Array.from({ length: 17 }, (_, i) => {
          const angle = -Math.PI / 2 + (i * Math.PI) / 16;
          return [15 + 6.5 * Math.cos(angle), 10 + 3.4 * Math.sin(angle)];
        }),
        WHITE,
        2
      ),
    ],
  },
  ethiopia: {
    layers: [
      hstripes(["#078930", "#fcdd09", "#da121a"]),
      // Odd sizes, so the star sits exactly in the middle of its disc.
      pixelDisc(MID_X - 5, MID_Y - 5, 11, "#0f47af"),
      pixelStar(MID_X - 3, MID_Y - 3, "#fcdd09", 7),
    ],
  },
  fiji: {
    layers: ensign(
      "#68bfe5",
      // The shield: St George's cross under a red chief with the gold lion,
      // centred in the 15 columns right of the canton.
      pixels(19, 6, ["rryrr", "wwrww", "rrrrr", "wwrww", ".wrw."], {
        r: "#ce1126",
        y: "#ffd100",
        w: WHITE,
      })
    ),
  },
  finland: { layers: [fill(WHITE), cross(10.8, 10, 5, "#002f6c")] },
  france: { layers: [vstripes(["#0055a4", WHITE, "#ef4135"])] },
  gabon: { layers: hstripes(["#009e60", "#fcd116", "#3a75c4"]) },
  gambia: {
    layers: hstripes(
      ["#ce1126", WHITE, "#0c1c8c", WHITE, "#3a7728"],
      [6, 1, 4, 1, 6]
    ),
  },
  georgia: {
    layers: [
      fill(WHITE),
      cross(15, 10, 3.4, "#ff0000"),
      // The four bolnisi crosses.
      ...[
        [5, 3],
        [21, 3],
        [5, 13],
        [21, 13],
      ].map(([x, y]) => pixels(x, y, [".r.", "rrr", ".r."], { r: "#ff0000" })),
    ],
  },
  germany: { layers: [hstripes([BLACK, "#dd0000", "#ffce00"])] },
  ghana: {
    layers: [
      hstripes(["#ce1126", "#fcd116", "#006b3f"]),
      pixelStar(MID_X - 3, MID_Y - 3, BLACK, 7),
    ],
  },
  greece: {
    layers: [
      // Nine stripes of 2px, the last taking the 19th row (it's the shaded
      // one anyway), so they're all the same height.
      ...Array.from({ length: 9 }, (_, i) =>
        pixelRect(
          0,
          i * 2,
          INTERIOR_WIDTH,
          i === 8 ? 3 : 2,
          i % 2 ? WHITE : "#0d5eaf"
        )
      ),
      // The canton is five stripes square, its cross as wide as a stripe and
      // lined up with the third one.
      pixelRect(0, 0, 10, 10, "#0d5eaf"),
      pixelRect(0, 4, 10, 2, WHITE),
      pixelRect(4, 0, 2, 10, WHITE),
    ],
  },
  grenada: {
    layers: [
      fill("#ce1126"),
      poly(
        [
          [2.2, 2.2],
          [27.8, 2.2],
          [15, 10],
        ],
        "#fcd116"
      ),
      poly(
        [
          [2.2, 17.8],
          [27.8, 17.8],
          [15, 10],
        ],
        "#fcd116"
      ),
      poly(
        [
          [2.2, 2.2],
          [15, 10],
          [2.2, 17.8],
        ],
        "#007a5e"
      ),
      poly(
        [
          [27.8, 2.2],
          [15, 10],
          [27.8, 17.8],
        ],
        "#007a5e"
      ),
      circle(15, 10, 2.4, "#ce1126", 3),
      // Six stars in the border, one in the disc, and the nutmeg.
      pixels(MID_X - 5, 0, ["y....y....y"], { y: "#fcd116" }),
      pixels(MID_X - 5, 18, ["y....y....y"], { y: "#fcd116" }),
      pixels(MID_X, MID_Y, ["y"], { y: "#fcd116" }),
      pixels(4, 8, [".y", "yr"], { y: "#fcd116", r: "#ce1126" }),
    ],
  },
  guatemala: {
    layers: [
      vstripes(["#4997d0", WHITE, "#4997d0"]),
      // The quetzal and scroll inside a laurel wreath.
      pixels(
        MID_X - 2,
        MID_Y - 2,
        [".g.g.", "g.n.g", "gyyyg", "g...g", ".g.g."],
        {
          g: "#3a7d2c",
          n: "#2e8b57",
          y: "#e8d38a",
        }
      ),
    ],
  },
  guinea: { layers: vstripes(["#ce1126", "#fcd116", "#009460"]) },
  "guinea-bissau": {
    layers: [
      hstripes(["#fcd116", "#009e49"]),
      // 9px exactly, so the band doesn't leave a stray pixel at the seam
      // and the 7px star centres in it.
      pixelRect(0, 0, 9, INTERIOR_HEIGHT, "#ce1126"),
      pixelStar(1, 6, BLACK, 7),
    ],
  },
  guyana: {
    layers: [
      fill("#009e49"),
      poly(
        [
          [0, 0],
          [30, 10],
          [0, 20],
        ],
        WHITE
      ),
      poly(
        [
          [0, 1.3],
          [27.5, 10],
          [0, 18.7],
        ],
        "#fcd116"
      ),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        BLACK
      ),
      poly(
        [
          [0, 1.6],
          [12.8, 10],
          [0, 18.4],
        ],
        "#ce1126"
      ),
    ],
  },
  haiti: {
    layers: [
      hstripes(["#00209f", "#d21034"]),
      // The white panel and its palm, both odd-sized so they centre exactly.
      pixelRect(MID_X - 4, MID_Y - 3, 9, 7, WHITE),
      pixels(
        MID_X - 3,
        MID_Y - 2,
        ["..ggg..", "ggggggg", "g..n..g", "...n...", "ggggggg"],
        {
          g: "#016a16",
          n: "#7a5c3a",
        }
      ),
    ],
  },
  honduras: {
    layers: [
      hstripes(["#0073cf", WHITE, "#0073cf"]),
      // Five stars in an X, dead centre.
      pixels(MID_X - 2, MID_Y - 1, ["b...b", "..b..", "b...b"], {
        b: "#0073cf",
      }),
    ],
  },
  hungary: { layers: hstripes(["#ce2939", WHITE, "#477050"]) },
  iceland: {
    layers: [
      fill("#02529c"),
      cross(10.8, 10, 4.6, WHITE),
      cross(10.8, 10, 2.2, "#dc1e35"),
    ],
  },
  india: {
    layers: [
      hstripes(["#ff9933", WHITE, "#138808"]),
      // The Ashoka Chakra.
      pixels(
        MID_X - 2,
        MID_Y - 2,
        [".nnn.", "n.n.n", "nnnnn", "n.n.n", ".nnn."],
        {
          n: "#000080",
        }
      ),
    ],
  },
  indonesia: { layers: hstripes(["#ce1126", WHITE]) },
  iran: {
    layers: [
      hstripes(["#239f40", WHITE, "#da0000"]),
      // The stylised "Allah" emblem.
      pixels(MID_X - 2, MID_Y - 1, ["r.r.r", "r.r.r", ".rrr.", "..r.."], {
        r: "#da0000",
      }),
    ],
  },
  iraq: {
    layers: [
      hstripes(["#ce1126", WHITE, BLACK]),
      // "Allahu akbar" in green Kufic script, read right to left: "akbar" on
      // the left (alif, kaf with its flag, ba's tooth, ra's tail dropping
      // below the line), "allah" on the right (alif and two lams standing
      // on the baseline, the ha hooked at its end). 15px wide, centred.
      pixels(
        MID_X - 7,
        MID_Y - 2,
        [
          "..gg.g....g.g.g",
          "...g.g....g.g.g",
          ".g.g.g..g.g.g.g",
          ".ggggg..ggggggg",
          "g..............",
        ],
        { g: "#007a3d" }
      ),
    ],
  },
  ireland: { layers: vstripes(["#169b62", WHITE, "#ff883e"]) },
  israel: {
    layers: [
      fill(WHITE),
      rect(0, 2, 30, 3, "#0038b8"),
      rect(0, 15, 30, 3, "#0038b8"),
      // The Star of David, outlined.
      pixels(
        MID_X - 3,
        MID_Y - 3,
        [
          "...b...",
          "..b.b..",
          "bbbbbbb",
          ".b...b.",
          "bbbbbbb",
          "..b.b..",
          "...b...",
        ],
        {
          b: "#0038b8",
        }
      ),
    ],
  },
  italy: { layers: [vstripes(["#009246", WHITE, "#ce2b37"])] },
  jamaica: {
    layers: [
      poly(
        [
          [0, 0],
          [30, 0],
          [15, 10],
        ],
        "#009b3a"
      ),
      poly(
        [
          [0, 20],
          [30, 20],
          [15, 10],
        ],
        "#009b3a"
      ),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        BLACK
      ),
      poly(
        [
          [30, 0],
          [15, 10],
          [30, 20],
        ],
        BLACK
      ),
      band(0, 0, 30, 20, 3.2, "#fed100"),
      band(0, 20, 30, 0, 3.2, "#fed100"),
    ],
  },
  // The disc is three-fifths of the height: 11 rows, round both ways.
  japan: {
    layers: [fill(WHITE), pixelDisc(MID_X - 5, MID_Y - 5, 11, "#bc002d")],
  },
  jordan: {
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
      // The seven-pointed star, big enough to read and on the middle row.
      pixels(
        1,
        6,
        [
          "...w...",
          ".w.w.w.",
          "..www..",
          "wwwwwww",
          "..www..",
          ".ww.ww.",
          ".w...w.",
        ],
        { w: WHITE }
      ),
    ],
  },
  kazakhstan: {
    layers: [
      fill("#00afca"),
      // The sun and the steppe eagle under it, both centred across.
      pixelTrace(
        MID_X - 5,
        1,
        11,
        11,
        sunTest(3.5, 5.5, 12, 0.45, Math.PI / 12),
        "#fec50c"
      ),
      pixels(
        MID_X - 5,
        13,
        mirrorHalves(["yy....", ".yyy..", "..yyyy", ".....y"], { odd: true }),
        { y: "#fec50c" }
      ),
      // The ornament down the hoist: five motifs, mirrored about the middle
      // row so it's the same from the top as from the bottom.
      pixels(
        1,
        0,
        Array.from({ length: 19 }, (_, row) =>
          row % 4 === 3 ? "." : row % 4 === 1 ? "yy" : "y"
        ),
        { y: "#fec50c" }
      ),
    ],
  },
  kenya: {
    layers: [
      hstripes([BLACK, WHITE, "#bb0000", WHITE, "#006600"], [6, 1, 6, 1, 6]),
      // The crossed spears, one traced and the other its mirror image.
      pixelCells(
        Array.from({ length: 16 }, (_, i) => {
          const x = Math.round(8 + (i * 11) / 15);
          return [
            [x, 17 - i],
            [INTERIOR_WIDTH - 1 - x, 17 - i],
          ];
        }).flat(),
        WHITE
      ),
      // The Maasai shield: black edges, red middle, white markings, all
      // mirrored about the middle column.
      pixels(
        MID_X - 3,
        MID_Y - 8,
        mirrorHalves(
          [
            "..kk",
            ".kkk",
            "kkrr",
            "kkrr",
            "kkrr",
            "kkrr",
            "kkww",
            "kkrr",
            "kwrr",
            "kkrr",
            "kkww",
            "kkrr",
            "kkrr",
            "kkrr",
            "kkrr",
            ".kkk",
            "..kk",
          ],
          { odd: true }
        ),
        { k: BLACK, r: "#bb0000", w: WHITE }
      ),
    ],
  },
  kiribati: {
    layers: [
      fill("#ce1126"),
      // The rising sun and its rays.
      // Turned half a ray, so none points straight up into the bird.
      star(15, 11, 6, "#fcd116", {
        points: 17,
        inner: 0.6,
        rotation: Math.PI / 17,
      }),
      circle(15, 11, 3.4, "#fcd116"),
      // The frigatebird.
      pixels(MID_X - 4, 1, ["yyy...yyy", "..yyyyy..", "....y...."], {
        y: "#fcd116",
      }),
      // Blue and white waves.
      pixels(
        0,
        10,
        // Three white waves, each stepping up and down a pixel.
        Array.from({ length: 9 }, (_, y) =>
          Array.from({ length: INTERIOR_WIDTH }, (_, x) =>
            (y - (x % 8 < 4 ? 0 : 1)) % 3 === 1 ? "w" : "b"
          ).join("")
        ),
        { b: "#003f87", w: WHITE }
      ),
    ],
  },
  kuwait: {
    layers: [
      hstripes(["#007a3d", WHITE, "#ce1126"]),
      poly(
        [
          [0, 0],
          [7.5, 6.67],
          [7.5, 13.33],
          [0, 20],
        ],
        BLACK
      ),
    ],
  },
  kyrgyzstan: {
    layers: [
      fill("#e8112d"),
      // The sun, traced symmetric about its middle row (the cloth's) and
      // column, with the tunduk (the crossed roof of a yurt) dead centre.
      pixelTrace(
        MID_X - 6,
        MID_Y - 6,
        13,
        13,
        sunTest(4, 6.5, 24, 0.3),
        "#ffef00"
      ),
      pixels(
        MID_X - 2,
        MID_Y - 2,
        [".rrr.", "r.r.r", "rrrrr", "r.r.r", ".rrr."],
        {
          r: "#e8112d",
        }
      ),
    ],
  },
  laos: {
    layers: [
      hstripes(["#ce1126", "#002868", "#ce1126"], [1, 2, 1]),
      pixelDisc(MID_X - 3, MID_Y - 3, 7, WHITE),
    ],
  },
  latvia: { layers: hstripes(["#9e3039", WHITE, "#9e3039"], [2, 1, 2]) },
  lebanon: {
    layers: [
      hstripes(["#ed1c24", WHITE, "#ed1c24"], [1, 2, 1]),
      // The cedar.
      pixels(
        MID_X - 3,
        MID_Y - 3,
        [
          "...g...",
          "..ggg..",
          ".ggggg.",
          "..ggg..",
          "ggggggg",
          "...n...",
          "...n...",
        ],
        {
          g: "#00a651",
          n: "#00a651",
        }
      ),
    ],
  },
  lesotho: {
    layers: [
      hstripes(["#00209f", WHITE, "#009543"], [3, 4, 3]),
      // The mokorotlo hat: a cone with a rounded top under its knob.
      pixels(
        MID_X - 3,
        MID_Y - 3,
        ["...k...", "..kkk..", "..kkk..", ".kkkkk.", ".kkkkk.", "kkkkkkk"],
        {
          k: BLACK,
        }
      ),
    ],
  },
  liberia: {
    layers: [
      // As the United States: 11 stripes won't divide 19 rows evenly, so one
      // stripe per row keeps red and white the same height (10 rows to 9).
      ...Array.from({ length: 19 }, (_, row) =>
        pixelRect(0, row, INTERIOR_WIDTH, 1, row % 2 ? WHITE : "#bf0a30")
      ),
      // A square canton over the top nine rows, ending on a red one, with
      // its star dead centre.
      pixelRect(0, 0, 9, 9, "#002868"),
      pixelStar(1, 1, WHITE, 7),
    ],
  },
  libya: {
    layers: [
      hstripes(["#e70013", BLACK, "#239e46"], [1, 2, 1]),
      // The crescent and star as one group centred on the flag: the moon's
      // body is cols 9-13 and the star 15-19, either side of the middle.
      pixelCrescent(MID_X - 5, MID_Y - 3, 7, WHITE),
      pixelStar(MID_X + 1, MID_Y - 2, WHITE, 5),
    ],
  },
  liechtenstein: {
    layers: [
      hstripes(["#002b7f", "#ce1126"]),
      // The prince's crown.
      pixels(4, 2, ["y.y.y", "yyyyy", "yyyyy"], { y: "#ffd83d" }),
    ],
  },
};
