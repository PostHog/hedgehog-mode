// Territories with their own flags, Åland → Guam. See ../draw.mjs for the DSL.
import {
  BLACK,
  UK_BLUE,
  WHITE,
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
  vstripes,
} from "../draw.mjs";

/** One pixel per dot, evenly round a circle (interior pixel coords). */
const dotRing = (cx, cy, r, count, color) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i * 2 * Math.PI) / count;
    return pixels(
      Math.round(cx + r * Math.sin(angle)),
      Math.round(cy - r * Math.cos(angle)),
      ["s"],
      { s: color }
    );
  });

export const flags = {
  "aland-islands": {
    layers: [
      fill("#0064ae"),
      cross(11, 10, 5.4, "#ffce00"),
      cross(11, 10, 2.6, "#da0e15"),
    ],
  },
  "american-samoa": {
    layers: [
      fill("#002b7f"),
      poly(
        [
          [30, 0],
          [0, 10],
          [30, 20],
        ],
        "#bf0a30"
      ),
      poly(
        [
          [30, 1.9],
          [3.8, 10],
          [30, 18.1],
        ],
        WHITE
      ),
      // The eagle, clutching its war club and fly whisk.
      pixels(18, 6, ["..nn...", ".nnnn..", "nnnnnny", ".nnny..", "..y...."], {
        n: "#6b4423",
        y: "#f2c75c",
      }),
    ],
  },
  anguilla: {
    // White shield: three orange dolphins over a turquoise sea.
    layers: ensign(
      UK_BLUE,
      pixels(
        18,
        5,
        ["wwwwww", "wowwow", "wwwwww", "wwooww", "tttttt", "tttttt", ".tttt."],
        { w: WHITE, o: "#f7a21b", t: "#3dc2d6" }
      )
    ),
  },
  aruba: {
    layers: [
      fill("#418fde"),
      rect(0, (13 * 20) / 19, 30, 20 / 19, "#fbe122"),
      rect(0, (15 * 20) / 19, 30, 20 / 19, "#fbe122"),
      // The four-pointed red star, edged in white.
      pixels(
        1,
        1,
        [
          "...w...",
          "..wrw..",
          ".wrrrw.",
          "wrrrrrw",
          ".wrrrw.",
          "..wrw..",
          "...w...",
        ],
        { w: WHITE, r: "#ef3340" }
      ),
    ],
  },
  bermuda: {
    // A red ensign: the white shield's red lion holds the shipwreck.
    layers: ensign(
      "#cf142b",
      pixels(
        18,
        5,
        ["wwwwww", "wrrrww", "wrbbrw", "wrbbrw", "wwrrww", "wwwwww", ".wwww."],
        { w: WHITE, r: "#cf142b", b: "#3a75c4" }
      )
    ),
  },
  "british-indian-ocean-territory": {
    // The wavy lines drawn straight; the crowned palm on the fly.
    layers: ensign(
      hstripes(
        Array.from({ length: 13 }, (_, i) => (i % 2 ? "#000063" : WHITE))
      ),
      pixels(
        19,
        6,
        ["..y..", ".yyy.", "ggggg", "g.n.g", "..n..", "..n..", "..n.."],
        { y: "#ffd100", g: "#007a33", n: "#7b5a3c" }
      )
    ),
  },
  "british-virgin-islands": {
    // Green shield: St Ursula in white between her golden lamps.
    layers: ensign(
      UK_BLUE,
      pixels(
        18,
        5,
        ["gggggg", "gyggyg", "ggwwgg", "gwwwwg", "gywwyg", "ggwwgg", ".gggg."],
        { g: "#00843d", y: "#ffd100", w: WHITE }
      )
    ),
  },
  "cayman-islands": {
    // Turtle crest over the shield's red chief (gold lion) and waves.
    layers: ensign(
      UK_BLUE,
      pixels(
        18,
        4,
        [
          "..gg..",
          ".gggg.",
          "rryrrr",
          "ryyyrr",
          "bwbwbw",
          "wbwbwb",
          "bwbwbw",
          ".wbwb.",
        ],
        { g: "#00843d", r: "#c8102e", y: "#ffd100", b: "#3a75c4", w: WHITE }
      )
    ),
  },
  "christmas-island": {
    layers: [
      poly(
        [
          [0, 0],
          [0, 20],
          [30, 20],
        ],
        "#0021ad"
      ),
      poly(
        [
          [0, 0],
          [30, 0],
          [30, 20],
        ],
        "#1c8a42"
      ),
      // The Southern Cross on the blue.
      pixelStar(1, 12, WHITE, 3),
      pixelStar(5, 8, WHITE, 3),
      pixelStar(9, 14, WHITE, 3),
      pixelStar(4, 15, WHITE, 3),
      pixels(7, 12, ["s"], { s: WHITE }),
      // The golden bosun bird on the green.
      pixels(17, 2, ["yy.......", ".yyy.....", "..yyyyyyy", "....yy..."], {
        y: "#ffc639",
      }),
      // The island on a golden disc.
      circle(15, 10, 3.6, "#ffc639"),
      pixels(13, 8, ["gg.", "ggg", ".g."], { g: "#1c8a42" }),
    ],
  },
  "cocos-islands": {
    layers: [
      fill("#008000"),
      // Palm tree on a golden disc in the canton.
      circle(5.5, 5.5, 4.2, "#ffe000"),
      pixels(3, 2, [".ggg.", "gg.gg", "g.g.g", "..g..", "..g.."], {
        g: "#008000",
      }),
      pixels(13, 7, ["..yy", ".yy.", "yy..", "yy..", ".yy.", "..yy"], {
        y: "#ffe000",
      }),
      // The Southern Cross on the fly.
      pixelStar(22, 1, "#ffe000", 3),
      pixelStar(18, 7, "#ffe000", 3),
      pixelStar(24, 8, "#ffe000", 3),
      pixelStar(21, 14, "#ffe000", 3),
      pixels(22, 11, ["s"], { s: "#ffe000" }),
    ],
  },
  "cook-islands": {
    layers: ensign(
      UK_BLUE,
      // A ring of fifteen white stars.
      dotRing(21, 9, 5, 15, WHITE)
    ),
  },
  curacao: {
    layers: [
      fill("#002b7f"),
      rect(0, 12.5, 30, 2.5, "#f9e814"),
      pixelStar(1, 1, WHITE, 3),
      pixelStar(4, 3, WHITE),
    ],
  },
  "falkland-islands": {
    // The ram on its tussock above the Desire on the waves.
    layers: ensign(
      UK_BLUE,
      pixels(
        18,
        5,
        ["bbbbbb", "bwwwbb", "bwwwwb", "gggggg", "wbwbwb", "bwbwbw", ".wbwb."],
        { b: "#4f9bd9", w: WHITE, g: "#3a8f3a" }
      )
    ),
  },
  "faroe-islands": {
    layers: [
      fill(WHITE),
      cross(11, 10, 5, "#005eb8"),
      cross(11, 10, 2.6, "#ef303e"),
    ],
  },
  "french-polynesia": {
    // The sun over the sea, with the red canoe between.
    layers: [
      hstripes(["#ce1126", WHITE, "#ce1126"], [1, 2, 1]),
      pixels(
        11,
        6,
        [
          "..yyy..",
          ".yyyyy.",
          "yyyyyyy",
          "rrrrrrr",
          "bwbwbwb",
          ".bwbwb.",
          "..bbb..",
        ],
        { y: "#ffc72c", r: "#ce1126", b: "#0033a0", w: WHITE }
      ),
    ],
  },
  "french-southern-territories": {
    layers: [
      fill("#002395"),
      // The tricolour canton, edged in white.
      rect(0, 0, 14.3, 9.6, WHITE),
      box(0, 0, 13.5, 9, vstripes(["#002395", WHITE, "#ed2939"])),
      // The TAAF monogram under its arc of five stars.
      pixels(
        17,
        7,
        [
          "w.w.w.w.w",
          ".........",
          "..w.w.w..",
          "..wwwww..",
          "..w.w.w..",
          "....w....",
        ],
        { w: WHITE }
      ),
    ],
  },
  gibraltar: {
    // The castle, and its golden key hanging into the red.
    layers: [
      hstripes([WHITE, "#da000c"], [2, 1]),
      pixels(
        10,
        3,
        [
          "rr.rrr.rr",
          "rr.rrr.rr",
          "rrrrrrrrr",
          "rrrrrrrrr",
          "rrrkkkrrr",
          "rrrkkkrrr",
          "rrrrrrrrr",
          "....y....",
          "....y....",
          "...yyy...",
          "...y.y...",
          "...yyy...",
        ],
        { r: "#da000c", k: BLACK, y: "#f8d80f" }
      ),
    ],
  },
  greenland: {
    layers: [
      hstripes([WHITE, "#d00c33"]),
      // The disc swaps the colours: red over white.
      poly(halfDisc(11.7, 10, 6.7, -1), "#d00c33", 1.5),
      poly(halfDisc(11.7, 10, 6.7, 1), WHITE, 1.5),
    ],
  },
  guam: {
    // The seal: a red-edged almond of sky, palm, sea and sand.
    layers: [
      fill("#c62139"),
      rect(0.9, 0.9, 28.2, 18.2, "#00297b"),
      pixels(
        11,
        3,
        [
          "...r...",
          "..rlr..",
          ".rllgr.",
          ".rlggr.",
          "rllnllr",
          "rllnllr",
          "rbbnbbr",
          "rbbbbbr",
          ".rsssr.",
          ".rsssr.",
          "..rsr..",
          "...r...",
        ],
        {
          r: "#c62139",
          l: "#8ecaf1",
          g: "#2e8b3a",
          n: "#7b5a3c",
          b: "#2b6cb0",
          s: "#e8c88a",
        }
      ),
    ],
  },
};

/** Half a circle as a polygon: `side` -1 is the top half, 1 the bottom. */
function halfDisc(cx, cy, r, side) {
  return Array.from({ length: 25 }, (_, i) => {
    const angle = (i / 24) * Math.PI;
    return [cx + r * Math.cos(angle), cy + side * r * Math.sin(angle)];
  });
}
