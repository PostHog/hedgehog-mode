// Territories with their own flags, Åland → Guam.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  FLY_MID,
  INTERIOR_HEIGHT,
  INTERIOR_WIDTH,
  MID_X,
  MID_Y,
  UK_BLUE,
  WHITE,
  discRows,
  ensign,
  fill,
  hstripes,
  nordicCross,
  pixelCrescent,
  pixelDisc,
  pixelRect,
  pixelStar,
  pixelStarRing,
  pixels,
  poly,
  rect,
} from "../draw.mjs";

export const flags = {
  "aland-islands": {
    layers: [
      fill("#0064ae"),
      // 1px of gold either side of a 3px red cross, on both arms; the
      // horizontal arm centres on the middle row.
      nordicCross(9, MID_Y - 1, [
        [5, "#ffce00"],
        [3, "#da0e15"],
      ]),
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
      pixels(
        19,
        MID_Y - 2,
        ["..nn...", ".nnnn..", "nnnnnny", ".nnny..", "..y...."],
        {
          n: "#6b4423",
          y: "#f2c75c",
        }
      ),
    ],
  },
  anguilla: {
    // White shield: three orange dolphins over a turquoise sea.
    layers: ensign(
      UK_BLUE,
      pixels(
        FLY_MID - 3,
        MID_Y - 3,
        [
          "wwwwwww",
          "wowwwow",
          "wwwwwww",
          "wwoooww",
          "ttttttt",
          "ttttttt",
          ".ttttt.",
        ],
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
    // Symmetric, 7 wide and 9 tall, centred on the fly and the middle row.
    layers: ensign(
      "#cf142b",
      pixels(
        FLY_MID - 3,
        MID_Y - 4,
        [
          "wwwwwww",
          "wrrrrrw",
          "wrbbbrw",
          "wrbbbrw",
          "wrrrrrw",
          "wwwwwww",
          ".wwwww.",
          "..www..",
          "...w...",
        ],
        { w: WHITE, r: "#cf142b", b: "#3a75c4" }
      )
    ),
  },
  "british-indian-ocean-territory": {
    // The wavy lines drawn straight, one per pixel row (13 don't divide into
    // 19 rows evenly, and rounding left it twice as blue as white); the
    // crowned palm on the fly.
    layers: ensign(
      hstripes(
        Array.from({ length: 19 }, (_, i) => (i % 2 ? "#000063" : WHITE))
      ),
      pixels(
        FLY_MID - 2,
        MID_Y - 3,
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
        FLY_MID - 3,
        MID_Y - 3,
        [
          "ggggggg",
          "gygggyg",
          "gggwggg",
          "ggwwwgg",
          "gywwwyg",
          "gggwggg",
          ".ggggg.",
        ],
        { g: "#00843d", y: "#ffd100", w: WHITE }
      )
    ),
  },
  "cayman-islands": {
    // Turtle crest over the shield's red chief (gold lion) and waves.
    layers: ensign(
      UK_BLUE,
      pixels(
        FLY_MID - 3,
        MID_Y - 4,
        [
          "..ggg..",
          ".ggggg.",
          "rrryrrr",
          "rryyyrr",
          "bwbwbwb",
          "wbwbwbw",
          "bwbwbwb",
          ".wbwbw.",
          "..wbw..",
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
      // The Southern Cross on the blue, laid out as on the Australian flag:
      // Gamma over Alpha, Beta to the left, Delta a touch higher on the
      // right, and little Epsilon between Delta and Alpha.
      ...[
        [5, 7],
        [5, 16],
        [2, 11],
        [8, 10],
      ].map(([x, y]) => pixelStar(x - 1, y - 1, WHITE, 3)),
      pixelRect(7, 13, 1, 1, WHITE),
      // The golden bosun bird on the green: a wing sweeping down from its tip
      // into the body, the head towards the fly with the beak pointing down,
      // and the long tail streamer trailing off towards the hoist.
      pixels(
        18,
        1,
        [
          "......yy..",
          "....y..yy.",
          "....yyy.y.",
          "......yyy.",
          ".....yyyyy",
          ".yyyy.....",
        ],
        { y: "#ffc639" }
      ),
      // The island on a golden disc, both centred on the middle pixel: a
      // small irregular shape — the north-west point, the bulk, a southern
      // tip — so the gold still reads as a disc rather than a ring.
      pixelDisc(MID_X - 3, MID_Y - 3, 7, "#ffc639"),
      pixels(
        MID_X - 1,
        MID_Y - 1,
        ["gg.", ".gg", ".g."],
        // Darker than the field, so it reads as land rather than a hole.
        { g: "#0b5d2a" }
      ),
    ],
  },
  "cocos-islands": {
    layers: [
      fill("#008000"),
      // Palm tree on a golden disc in the canton, both centred on (5, 5).
      pixelDisc(1, 1, 9, "#ffe000"),
      pixels(3, 3, [".ggg.", "gg.gg", "g.g.g", "..g..", "..g.."], {
        g: "#008000",
      }),
      // The crescent in the middle, on the middle row.
      pixelCrescent(MID_X - 2, MID_Y - 3, 7, "#ffe000"),
      // The Southern Cross on the fly.
      pixelStar(23, 1, "#ffe000", 3),
      pixelStar(19, 7, "#ffe000", 3),
      pixelStar(25, 8, "#ffe000", 3),
      pixelStar(22, 14, "#ffe000", 3),
      pixels(23, 11, ["s"], { s: "#ffe000" }),
    ],
  },
  "cook-islands": {
    layers: ensign(
      UK_BLUE,
      // The ring of stars, one pixel each, centred in the fly: fourteen in an
      // even ring (the real fifteen merge at this size).
      pixelStarRing(FLY_MID, MID_Y, 5, 14, WHITE)
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
        FLY_MID - 3,
        MID_Y - 3,
        [
          "bbbbbbb",
          "bbwwwbb",
          "bwwwwwb",
          "ggggggg",
          "wbwbwbw",
          "bwbwbwb",
          ".wbwbw.",
        ],
        { b: "#4f9bd9", w: WHITE, g: "#3a8f3a" }
      )
    ),
  },
  "faroe-islands": {
    layers: [
      fill(WHITE),
      // 1px of blue either side of a 3px red cross; the horizontal arm
      // centres on the middle row.
      nordicCross(9, MID_Y - 1, [
        [5, "#005eb8"],
        [3, "#ef303e"],
      ]),
    ],
  },
  "french-polynesia": {
    // The sun over the sea, with the red canoe between.
    layers: [
      hstripes(["#ce1126", WHITE, "#ce1126"], [1, 2, 1]),
      pixels(
        MID_X - 3,
        MID_Y - 3,
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
      // The tricolour canton in exact pixels (4px stripes), edged in white.
      pixelRect(0, 0, 13, 10, WHITE),
      pixelRect(0, 0, 4, 9, "#002395"),
      pixelRect(8, 0, 4, 9, "#ed2939"),
      // The TAAF monogram under its arc of five stars.
      pixels(
        18,
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
        MID_X - 4,
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
      // White over red, split between rows 9 and 10, with a 12px disc
      // centred on the split that swaps the colours: red over white.
      fill(WHITE),
      pixelRect(0, 10, INTERIOR_WIDTH, 9, "#d00c33"),
      // Hoist-side, as on the real flag (its centre 7/18 of the way along).
      pixels(
        6,
        4,
        discRows(12).map((row, y) => row.replace(/s/g, y < 6 ? "r" : "w")),
        { r: "#d00c33", w: WHITE }
      ),
    ],
  },
  guam: {
    // The seal: a red-edged almond of sky, palm, sea and sand.
    layers: [
      // A 1px red border all round.
      fill("#c62139"),
      pixelRect(1, 1, INTERIOR_WIDTH - 2, INTERIOR_HEIGHT - 2, "#00297b"),
      // 13 rows, centred on the middle pixel.
      pixels(
        MID_X - 3,
        MID_Y - 6,
        [
          "...r...",
          "..rlr..",
          ".rllgr.",
          ".rlggr.",
          "rllnllr",
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
