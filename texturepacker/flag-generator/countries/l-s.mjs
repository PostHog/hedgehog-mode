// Lithuania → Saint Lucia. See ../draw.mjs for the DSL.
import {
  BLACK,
  UK_BLUE,
  WHITE,
  band,
  circle,
  crescent,
  cross,
  ensign,
  fill,
  hstripes,
  pixels,
  poly,
  rect,
  ring,
  star,
  vstripes,
} from "../draw.mjs";

const GOLD = "#fcd116";

export const flags = {
  lithuania: { layers: hstripes(["#fdb913", "#006a44", "#c1272d"]) },
  luxembourg: { layers: hstripes(["#ea141d", WHITE, "#00a2e1"]) },
  madagascar: {
    layers: [
      fill(WHITE),
      rect(10, 0, 20, 10, "#fc3d32"),
      rect(10, 10, 20, 10, "#007e3a"),
    ],
  },
  malawi: {
    layers: [
      hstripes([BLACK, "#ce1126", "#339e35"]),
      // The rising sun's lower half melts into the red stripe below it.
      star(15, 6.67, 5.5, "#ce1126", { points: 16, inner: 0.55 }),
    ],
  },
  malaysia: {
    layers: [
      hstripes(
        Array.from({ length: 14 }, (_, i) => (i % 2 ? WHITE : "#cc0001"))
      ),
      rect(0, 0, 15, 11.43, "#010066"),
      crescent(5, 5.7, 3.7, 6.3, 5.7, 3.1, "#ffcc00"),
      star(10.5, 5.7, 2.4, "#ffcc00", { points: 14, inner: 0.5 }),
    ],
  },
  maldives: {
    layers: [
      fill("#d21034"),
      rect(7, 4.5, 16, 11, "#007e3a"),
      crescent(15.5, 10, 3.8, 17, 10, 3.2, WHITE),
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
          [0, 20],
          [0, 18.5],
          [30, -1],
          [30, 4],
        ],
        "#dd7500"
      ),
      poly(
        [
          [0, 20],
          [30, 4],
          [30, 9],
        ],
        WHITE
      ),
      star(6, 5, 3.4, WHITE, { points: 24, inner: 0.5 }),
    ],
  },
  mauritania: {
    layers: [
      hstripes(["#d01c1f", "#00a95c", "#d01c1f"], [1, 3, 1]),
      crescent(15, 9, 5, 15, 6.8, 4.7, "#ffd700"),
      star(15, 7.3, 1.8, "#ffd700"),
    ],
  },
  mauritius: {
    layers: hstripes(["#eb2436", "#1a206d", "#ffd500", "#00a551"]),
  },
  micronesia: {
    layers: [
      fill("#75b2dd"),
      star(15, 4.5, 2.6, WHITE),
      star(15, 15.5, 2.6, WHITE),
      star(9, 10, 2.6, WHITE),
      star(21, 10, 2.6, WHITE),
    ],
  },
  moldova: {
    layers: [
      vstripes(["#0046ae", "#ffd200", "#cc092f"]),
      // The eagle holding a shield, as a brown bird over a red-and-blue crest.
      pixels(
        12,
        6,
        [".bbbb.", "bbbbbb", ".brrb.", ".brrb.", "..bb..", "..bb.."],
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
      pixels(
        2,
        2,
        [
          "..y..",
          ".yyy.",
          "..y..",
          ".yyy.",
          "y...y",
          ".yyy.",
          "yyyyy",
          "y...y",
          "y.y.y",
          "y...y",
          "yyyyy",
          "y...y",
          "yyyyy",
        ],
        { y: "#f9cf02" }
      ),
    ],
  },
  montenegro: {
    layers: [
      fill("#d4af37"),
      rect(1.2, 1.2, 27.6, 17.6, "#c40308"),
      // The double-headed eagle as a gold blob with a blue-and-green shield.
      pixels(
        10,
        5,
        [
          "yy....yy",
          ".yy..yy.",
          "yyyyyyyy",
          ".yybbyy.",
          "..ybgy..",
          "...yy...",
          "..y..y..",
        ],
        { y: "#d4af37", b: "#1d5e91", g: "#6d8c3e" }
      ),
    ],
  },
  morocco: {
    layers: [
      fill("#c1272d"),
      // The interlaced pentagram, as a green star with a red core.
      star(15, 10.4, 5.5, "#006233", { inner: 0.38 }),
      star(15, 10.4, 3, "#c1272d", { inner: 0.38, weight: 1 }),
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
      star(4.6, 10, 3.6, "#fce100"),
      // The book, rifle and hoe, as a dark smudge on the star.
      pixels(3, 9, ["kwk", ".k."], { k: BLACK, w: WHITE }),
    ],
  },
  myanmar: {
    layers: [
      hstripes(["#fecb00", "#34b233", "#ea2839"]),
      star(15, 11, 7.5, WHITE, { inner: 0.38, weight: 1 }),
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
      star(6, 5, 3.2, "#ffce00", { points: 12, inner: 0.6 }),
    ],
  },
  nauru: {
    layers: [
      fill("#002b7f"),
      rect(0, 9.3, 30, 1.4, "#ffc61e"),
      star(7.5, 14.6, 2.8, WHITE, { points: 12, inner: 0.55 }),
    ],
  },
  nepal: {
    // The only non-rectangular one: the border follows the two pennants.
    outline: [
      [0, 0],
      [22, 9],
      [10, 9],
      [24, 20],
      [0, 20],
    ],
    layers: [
      fill("#003893"),
      poly(
        [
          [1.5, 2.5],
          [17, 8.3],
          [6.5, 8.3],
          [19.5, 18.6],
          [1.5, 18.6],
        ],
        "#dc143c"
      ),
      crescent(7, 6.5, 2.6, 7, 5.2, 2.6, WHITE),
      star(7, 14, 2.4, WHITE, { points: 12, inner: 0.6 }),
    ],
  },
  netherlands: { layers: hstripes(["#ae1c28", WHITE, "#21468b"]) },
  "new-zealand": {
    layers: ensign(
      UK_BLUE,
      // The Southern Cross: red stars edged in white.
      ...[
        [22.5, 4],
        [19.5, 9.5],
        [26, 8.2],
        [22.5, 16],
      ].map(([x, y]) => star(x, y, 1.9, "#c8102e"))
    ),
  },
  nicaragua: {
    layers: [
      hstripes(["#0067c6", WHITE, "#0067c6"]),
      // The triangle of the coat of arms.
      pixels(12, 7, ["..g..", ".gbg.", "ggggg"], {
        g: "#c8a640",
        b: "#0067c6",
      }),
    ],
  },
  niger: {
    layers: [
      hstripes(["#e05206", WHITE, "#0db02b"]),
      circle(15, 10, 2.3, "#e05206"),
    ],
  },
  nigeria: { layers: vstripes(["#008751", WHITE, "#008751"]) },
  "north-korea": {
    layers: [
      hstripes(
        ["#024fa2", WHITE, "#ed1c27", WHITE, "#024fa2"],
        [6, 1, 15, 1, 6]
      ),
      circle(10, 10, 3.8, WHITE),
      star(10, 10.2, 3.4, "#ed1c27"),
    ],
  },
  "north-macedonia": {
    layers: [
      fill("#d20000"),
      // Eight rays widening out to the edges and corners.
      ...[
        [
          [13, 0],
          [17, 0],
        ],
        [
          [13, 20],
          [17, 20],
        ],
        [
          [0, 7.8],
          [0, 12.2],
        ],
        [
          [30, 7.8],
          [30, 12.2],
        ],
        [
          [0, 2.4],
          [0, 0],
          [3.6, 0],
        ],
        [
          [30, 2.4],
          [30, 0],
          [26.4, 0],
        ],
        [
          [0, 17.6],
          [0, 20],
          [3.6, 20],
        ],
        [
          [30, 17.6],
          [30, 20],
          [26.4, 20],
        ],
      ].map((edge) => poly([[15, 10], ...edge], "#ffe600")),
      circle(15, 10, 3.6, "#d20000"),
      circle(15, 10, 2.8, "#ffe600"),
    ],
  },
  norway: {
    layers: [
      fill("#ba0c2f"),
      cross(11, 10, 4.5, WHITE),
      cross(11, 10, 2.2, "#00205b"),
    ],
  },
  oman: {
    layers: [
      fill("#db161b"),
      rect(8, 0, 22, 6.67, WHITE),
      rect(8, 13.33, 22, 6.67, "#008000"),
      // The khanjar and crossed swords.
      pixels(2, 1, ["w.w.w", ".www.", "..w..", ".w.w."], { w: WHITE }),
    ],
  },
  pakistan: {
    layers: [
      fill("#01411c"),
      rect(0, 0, 7.5, 20, WHITE),
      crescent(18.5, 10.5, 5.6, 20.3, 9, 4.7, WHITE),
      star(22, 7.2, 1.9, WHITE, { rotation: 0.6 }),
    ],
  },
  palau: { layers: [fill("#4aadd6"), circle(13, 10, 5.5, "#ffde00")] },
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
    layers: [
      fill(WHITE),
      rect(15, 0, 15, 10, "#da121a"),
      rect(0, 10, 15, 10, "#072357"),
      star(7.5, 5, 3.2, "#072357"),
      star(22.5, 15, 3.2, "#da121a"),
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
      // The Southern Cross, one pixel per star.
      pixels(3, 10, [".w...", "...w.", ".....", "w....", "....w", "..w.."], {
        w: WHITE,
      }),
      // The bird of paradise, tail trailing off to the fly.
      pixels(
        15,
        3,
        ["..yy.....", ".yyyy....", "yy.yyy...", ".....yyy.", "......y.y"],
        { y: GOLD }
      ),
    ],
  },
  paraguay: {
    layers: [
      hstripes(["#d52b1e", WHITE, "#0038a8"]),
      ring(15, 10, 2.4, 0.8, "#3a7d2e"),
      pixels(13, 8, ["", ".y"], { y: "#ffd900" }),
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
      star(5.5, 10, 2.9, GOLD, { points: 8, inner: 0.5 }),
      pixels(1, 1, ["y"], { y: GOLD }),
      pixels(1, 17, ["y"], { y: GOLD }),
      pixels(13, 9, ["y"], { y: GOLD }),
    ],
  },
  portugal: {
    layers: [
      vstripes(["#006600", "#ff0000"], [2, 3]),
      // The armillary sphere with the shield on it.
      circle(12, 10, 3.8, "#ffcc00"),
      rect(10.5, 7.6, 3, 4.6, "#ff0000", 3),
      rect(11.3, 8.6, 1.4, 2.6, WHITE, 3),
    ],
  },
  qatar: {
    layers: [
      fill("#8a1538"),
      // Nine white points biting into the maroon.
      poly(
        [
          [0, 0],
          [8, 0],
          ...Array.from({ length: 18 }, (_, i) => [
            i % 2 ? 8 : 11,
            ((i + 1) * 20) / 18,
          ]),
          [0, 20],
        ],
        WHITE
      ),
    ],
  },
  romania: { layers: vstripes(["#002b7f", GOLD, "#ce1126"]) },
  russia: { layers: hstripes([WHITE, "#0039a6", "#d52b1e"]) },
  rwanda: {
    layers: [
      hstripes(["#00a1de", "#fad201", "#20603d"], [2, 1, 1]),
      star(24.5, 5, 3.4, "#e5be01", { points: 24, inner: 0.6 }),
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
      star(10.5, 13, 1.9, WHITE),
      star(19.5, 7, 1.9, WHITE),
    ],
  },
  "saint-lucia": {
    layers: [
      fill("#66ccff"),
      poly(
        [
          [15, 2.5],
          [21.5, 18],
          [8.5, 18],
        ],
        WHITE
      ),
      poly(
        [
          [15, 4.5],
          [20, 18],
          [10, 18],
        ],
        BLACK
      ),
      poly(
        [
          [15, 10],
          [21.5, 18],
          [8.5, 18],
        ],
        GOLD
      ),
    ],
  },
};
