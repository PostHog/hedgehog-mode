// Dominican Republic → Liechtenstein. See ../draw.mjs for the DSL.
import {
  BLACK,
  WHITE,
  band,
  circle,
  crescent,
  cross,
  ensign,
  fill,
  hstripes,
  pixelStar,
  pixels,
  poly,
  rect,
  star,
  vstripes,
} from "../draw.mjs";

/** An ellipse as a polygon (draw.mjs only has circles). */
const ellipse = (cx, cy, rx, ry, color, weight) =>
  poly(
    Array.from({ length: 32 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 32;
      return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
    }),
    color,
    weight
  );

export const flags = {
  "dominican-republic": {
    layers: [
      rect(0, 0, 15, 10, "#002d62"),
      rect(15, 0, 15, 10, "#ce1126"),
      rect(0, 10, 15, 10, "#ce1126"),
      rect(15, 10, 15, 10, "#002d62"),
      cross(15, 10, 3.2, WHITE),
      // The coat of arms, shrunk to a shield in the middle of the cross.
      pixels(13, 8, ["bg", "rb"], {
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
      pixels(12, 5, [".nnnn.", "nnyynn", ".bbbb.", ".bggb.", "..yy.."], {
        n: "#5c3d1e",
        y: "#ffdd00",
        b: "#4f9bd9",
        g: "#3a7d2c",
      }),
    ],
  },
  egypt: {
    layers: [
      hstripes(["#ce1126", WHITE, BLACK]),
      // The eagle of Saladin.
      pixels(12, 6, ["..g..", "ggggg", ".ggg.", ".g.g."], { g: "#c09300" }),
    ],
  },
  "el-salvador": {
    layers: [
      hstripes(["#0047ab", WHITE, "#0047ab"]),
      // The coat of arms: a gold-ringed triangle in a green wreath.
      pixels(12, 7, [".gyg.", "gy.yg", ".gyg."], {
        y: "#ffcc00",
        g: "#2e8b3a",
      }),
    ],
  },
  "equatorial-guinea": {
    layers: [
      hstripes(["#3e9a00", WHITE, "#e32118"]),
      poly(
        [
          [0, 0],
          [7, 10],
          [0, 20],
        ],
        "#0073ce"
      ),
      // The silk-cotton tree on its silver shield.
      pixels(15, 7, [".g.", "ggg", ".n."], { g: "#3e9a00", n: "#8c5a2b" }),
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
      pixels(4, 6, [".y.y.", "y.y.y", "y.y.y", "y.y.y", ".yyy.", "..y.."], {
        y: "#ffc726",
      }),
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
      circle(15, 10, 5, "#0f47af"),
      pixelStar(12, 7, "#fcdd09"),
    ],
  },
  fiji: {
    layers: ensign(
      "#68bfe5",
      // The shield: St George's cross under a red chief with the gold lion.
      pixels(18, 6, ["rryrr", "wwrww", "rrrrr", "wwrww", ".wrw."], {
        r: "#ce1126",
        y: "#ffd100",
        w: WHITE,
      })
    ),
  },
  finland: { layers: [fill(WHITE), cross(10.8, 10, 5, "#002f6c")] },
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
        [20, 3],
        [5, 13],
        [20, 13],
      ].map(([x, y]) => pixels(x, y, [".r.", "rrr", ".r."], { r: "#ff0000" })),
    ],
  },
  ghana: {
    layers: [
      hstripes(["#ce1126", "#fcd116", "#006b3f"]),
      pixelStar(11, 6, BLACK, 7),
    ],
  },
  greece: {
    layers: [
      hstripes(
        Array.from({ length: 9 }, (_, i) => (i % 2 ? WHITE : "#0d5eaf"))
      ),
      rect(0, 0, 11.1, 11.1, "#0d5eaf"),
      rect(0, 4.45, 11.1, 2.2, WHITE),
      rect(4.45, 0, 2.2, 11.1, WHITE),
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
      pixels(8, 0, ["y....y....y"], { y: "#fcd116" }),
      pixels(8, 18, ["y....y....y"], { y: "#fcd116" }),
      pixels(13, 9, ["y"], { y: "#fcd116" }),
      pixels(4, 8, [".y", "yr"], { y: "#fcd116", r: "#ce1126" }),
    ],
  },
  guatemala: {
    layers: [
      vstripes(["#4997d0", WHITE, "#4997d0"]),
      // The quetzal and scroll inside a laurel wreath.
      pixels(12, 6, [".g.g.", "g.n.g", "gyyyg", ".g.g."], {
        g: "#3a7d2c",
        n: "#2e8b57",
        y: "#e8d38a",
      }),
    ],
  },
  guinea: { layers: vstripes(["#ce1126", "#fcd116", "#009460"]) },
  "guinea-bissau": {
    layers: [
      hstripes(["#fcd116", "#009e49"]),
      // 9px exactly, so the band doesn't leave a stray pixel at the seam.
      rect(0, 0, 9.65, 20, "#ce1126"),
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
      rect(10.5, 6.5, 9, 7, WHITE),
      // The palm tree on its green mound.
      pixels(12, 6, [".ggg.", "g.n.g", "..n..", "ggggg"], {
        g: "#016a16",
        n: "#7a5c3a",
      }),
    ],
  },
  honduras: {
    layers: [
      hstripes(["#00bce4", WHITE, "#00bce4"]),
      // Five stars in an X.
      pixels(12, 7, ["b...b", "..b..", "b...b"], { b: "#00bce4" }),
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
      pixels(12, 7, [".nnn.", "n.n.n", "nnnnn", "n.n.n", ".nnn."], {
        n: "#000080",
      }),
    ],
  },
  indonesia: { layers: hstripes(["#ce1126", WHITE]) },
  iran: {
    layers: [
      hstripes(["#239f40", WHITE, "#da0000"]),
      // The stylised "Allah" emblem.
      pixels(12, 7, ["r.r.r", "r.r.r", ".rrr.", "..r.."], { r: "#da0000" }),
    ],
  },
  iraq: {
    layers: [
      hstripes(["#ce1126", WHITE, BLACK]),
      // "Allahu akbar" in green Kufic script.
      pixels(9, 8, ["g..g.g..g.", "gggggggggg"], { g: "#007a3d" }),
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
        11,
        6,
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
      star(5, 10, 2, WHITE, { points: 7 }),
    ],
  },
  kazakhstan: {
    layers: [
      fill("#00afca"),
      star(16, 7.5, 4.6, "#fec50c", { points: 16, inner: 0.7 }),
      circle(16, 7.5, 2.6, "#fec50c"),
      // The steppe eagle under the sun, and the ornament down the hoist.
      pixels(12, 11, ["yy.....yy", ".yyy.yyy.", "...yyy..."], { y: "#fec50c" }),
      pixels(
        1,
        1,
        [
          "y",
          "yy",
          "y",
          ".",
          "y",
          "yy",
          "y",
          ".",
          "y",
          "yy",
          "y",
          ".",
          "y",
          "yy",
          "y",
          ".",
          "y",
        ],
        {
          y: "#fec50c",
        }
      ),
    ],
  },
  kenya: {
    layers: [
      hstripes([BLACK, WHITE, "#bb0000", WHITE, "#006600"], [6, 1, 6, 1, 6]),
      band(9.5, 17.5, 20.5, 2.5, 0.8, WHITE, 2),
      band(9.5, 2.5, 20.5, 17.5, 0.8, WHITE, 2),
      // The Maasai shield: black edges, red middle, white markings.
      ellipse(15, 10, 3.2, 7.6, BLACK, 2),
      ellipse(15, 10, 1.6, 7.2, "#bb0000", 2),
      pixels(13, 9, [".w.", "", ".w."], { w: WHITE }),
    ],
  },
  kiribati: {
    layers: [
      fill("#ce1126"),
      // The rising sun and its rays.
      star(15, 11, 6, "#fcd116", { points: 17, inner: 0.6 }),
      circle(15, 11, 3.4, "#fcd116"),
      // The frigatebird.
      pixels(10, 1, ["yyy...yyy", "..yyyyy..", "....y...."], { y: "#fcd116" }),
      // Blue and white waves.
      pixels(
        0,
        10,
        // Three white waves, each stepping up and down a pixel.
        Array.from({ length: 9 }, (_, y) =>
          Array.from({ length: 28 }, (_, x) =>
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
      star(15, 10, 6, "#ffef00", { points: 20, inner: 0.65 }),
      circle(15, 10, 3.6, "#ffef00"),
      // The tunduk: the crossed roof of a yurt.
      pixels(12, 7, [".rrr.", "r.r.r", "rrrrr", "r.r.r", ".rrr."], {
        r: "#e8112d",
      }),
    ],
  },
  laos: {
    layers: [
      hstripes(["#ce1126", "#002868", "#ce1126"], [1, 2, 1]),
      circle(15, 10, 4, WHITE),
    ],
  },
  latvia: { layers: hstripes(["#9e3039", WHITE, "#9e3039"], [2, 1, 2]) },
  lebanon: {
    layers: [
      hstripes(["#ed1c24", WHITE, "#ed1c24"], [1, 2, 1]),
      // The cedar.
      pixels(
        11,
        5,
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
      // The mokorotlo hat.
      pixels(12, 6, ["..k..", ".kkk.", ".kkk.", "kkkkk", "k...k"], {
        k: BLACK,
      }),
    ],
  },
  liberia: {
    layers: [
      hstripes(
        Array.from({ length: 11 }, (_, i) => (i % 2 ? WHITE : "#bf0a30"))
      ),
      rect(0, 0, 9.1, 9.1, "#002868"),
      pixelStar(2, 2, WHITE),
    ],
  },
  libya: {
    layers: [
      hstripes(["#e70013", BLACK, "#239e46"], [1, 2, 1]),
      crescent(14, 10, 3, 15.1, 10, 2.4, WHITE, 3),
      star(17.6, 10, 1.6, WHITE),
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
