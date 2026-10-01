// Afghanistan → Dominica. See ../draw.mjs for the DSL.
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
  pixels,
  poly,
  rect,
  ring,
  saltire,
  star,
  starRing,
  vstripes,
} from "../draw.mjs";

export const flags = {
  afghanistan: {
    layers: [
      vstripes([BLACK, "#be0000", "#007a36"]),
      // The mosque-in-a-wreath emblem, as a white ring with a mihrab.
      pixels(
        11,
        6,
        ["..ww..", ".w..w.", "w.ww.w", "w.ww.w", ".w..w.", "..ww.."],
        {
          w: WHITE,
        }
      ),
    ],
  },
  albania: {
    layers: [
      fill("#e41e20"),
      // The double-headed eagle.
      pixels(
        9,
        5,
        [
          "..b....b..",
          ".bbb..bbb.",
          "b.bbbbbb.b",
          "bbbbbbbbbb",
          ".bbbbbbbb.",
          "..bbbbbb..",
          "...bbbb...",
          "..bb..bb..",
          "..b....b..",
        ],
        { b: BLACK }
      ),
    ],
  },
  algeria: {
    layers: [
      vstripes(["#006233", WHITE]),
      crescent(15, 10, 5, 16.4, 10, 4.1, "#d21034"),
      star(17.8, 10, 2.2, "#d21034", { rotation: -0.3 }),
    ],
  },
  andorra: {
    layers: [
      vstripes(["#10069f", "#fedf00", "#d50032"], [8, 9, 8]),
      // The coat of arms, as a small shield.
      pixels(12, 7, ["oooo", "orro", "orro", ".oo."], {
        o: "#8a5a1c",
        r: "#d50032",
      }),
    ],
  },
  angola: {
    layers: [
      hstripes(["#cc092f", BLACK]),
      // Half a cog wheel, a machete and a star.
      crescent(15, 10, 4.6, 16.6, 8.4, 3.9, "#ffcb00"),
      band(12, 13.5, 18.5, 6.5, 1.3, "#ffcb00"),
      star(16.5, 8, 1.5, "#ffcb00"),
    ],
  },
  "antigua-and-barbuda": {
    layers: [
      fill("#ce1126"),
      // The V: black sky, rising sun, blue sea, white sand.
      poly(
        [
          [0, 0],
          [30, 0],
          [23.25, 9],
          [6.75, 9],
        ],
        BLACK
      ),
      star(15, 9, 4.6, "#fcd116", { points: 16, inner: 0.7 }),
      poly(
        [
          [6.75, 9],
          [23.25, 9],
          [20.25, 13],
          [9.75, 13],
        ],
        "#0072c6"
      ),
      poly(
        [
          [9.75, 13],
          [20.25, 13],
          [15, 20],
        ],
        WHITE
      ),
    ],
  },
  argentina: {
    layers: [
      hstripes(["#74acdf", WHITE, "#74acdf"]),
      star(15, 10, 2.8, "#f6b40e", { points: 16, inner: 0.6 }),
    ],
  },
  armenia: { layers: hstripes(["#d90012", "#0033a0", "#f2a800"]) },
  australia: {
    layers: ensign(
      "#00008b",
      star(7.5, 15, 2.5, WHITE, { points: 7 }),
      star(23, 4, 1.4, WHITE, { points: 7 }),
      star(19.5, 9, 1.4, WHITE, { points: 7 }),
      star(26, 8, 1.4, WHITE, { points: 7 }),
      star(23, 16.5, 1.4, WHITE, { points: 7 })
    ),
  },
  austria: { layers: hstripes(["#c8102e", WHITE, "#c8102e"]) },
  azerbaijan: {
    layers: [
      hstripes(["#00b5e2", "#ef3340", "#509e2f"]),
      crescent(14, 10, 3, 14.9, 10, 2.4, WHITE),
      star(17.4, 10, 1.4, WHITE, { points: 8 }),
    ],
  },
  bahamas: {
    layers: [
      hstripes(["#00778b", "#ffc72c", "#00778b"]),
      poly(
        [
          [0, 0],
          [13, 10],
          [0, 20],
        ],
        BLACK
      ),
    ],
  },
  bahrain: {
    layers: [
      fill("#ce1126"),
      // The white hoist with five serrations.
      poly(
        [
          [0, 0],
          [7.5, 0],
          ...[0, 1, 2, 3, 4].flatMap((i) => [
            [11, 2 + i * 4],
            [7.5, 4 + i * 4],
          ]),
          [0, 20],
        ],
        WHITE
      ),
    ],
  },
  bangladesh: { layers: [fill("#006a4e"), circle(13.5, 10, 6, "#f42a41")] },
  barbados: {
    layers: [
      vstripes(["#00267f", "#ffc726", "#00267f"]),
      // The broken trident.
      pixels(
        12,
        6,
        ["b.b.b", "b.b.b", "bbbbb", "..b..", "..b..", ".bbb.", "..b.."],
        {
          b: BLACK,
        }
      ),
    ],
  },
  belarus: {
    layers: [
      hstripes(["#c8313e", "#4aa657"], [2, 1]),
      rect(0, 0, 3.25, 20, WHITE),
      // The red ornament down the hoist.
      pixels(
        0,
        0,
        Array.from(
          { length: 19 },
          (_, i) => [".r.", "rrr", ".r.", "..."][i % 4]
        ),
        { r: "#c8313e" }
      ),
    ],
  },
  belgium: { layers: vstripes([BLACK, "#fdda24", "#ef3340"]) },
  belize: {
    layers: [
      hstripes(["#ce1126", "#003f87", "#ce1126"], [1, 8, 1]),
      circle(15, 10, 5.5, WHITE),
      // The coat of arms in its wreath.
      ring(15, 10, 5.5, 1.1, "#4b8a3c"),
      circle(15, 10, 2, "#7a5230", 3),
    ],
  },
  benin: {
    layers: [hstripes(["#fcd116", "#e8112d"]), rect(0, 0, 12, 20, "#008751")],
  },
  bhutan: {
    layers: [
      fill("#ff4e12"),
      poly(
        [
          [0, 0],
          [30, 0],
          [0, 20],
        ],
        "#ffd520"
      ),
      // The thunder dragon, stretched along the diagonal.
      band(6, 15, 24, 5, 3.4, WHITE),
      circle(23.5, 4.5, 2, WHITE),
      pixels(6, 11, [".w...w", "w.w.w."], { w: WHITE }),
    ],
  },
  bolivia: { layers: hstripes(["#d52b1e", "#f9e300", "#007934"]) },
  "bosnia-and-herzegovina": {
    layers: [
      fill("#002395"),
      poly(
        [
          [8, 0],
          [22, 0],
          [22, 20],
        ],
        "#fecb00"
      ),
      // Stars along the hypotenuse.
      ...[0.8, 3.1, 5.4, 7.7, 10, 12.3, 14.6, 16.9, 19.2].map((y) =>
        star(5.5 + 0.7 * y, y, 1.2, WHITE, { weight: 4 })
      ),
    ],
  },
  botswana: {
    layers: hstripes(
      ["#75aadb", WHITE, BLACK, WHITE, "#75aadb"],
      [8, 1.5, 3.5, 1.5, 8]
    ),
  },
  brunei: {
    layers: [
      fill("#f7e017"),
      // White and black diagonal bands, hoist-top to fly-bottom.
      poly(
        [
          [0, 2],
          [0, 6],
          [30, 18],
          [30, 14],
        ],
        WHITE
      ),
      poly(
        [
          [0, 6],
          [0, 9],
          [30, 21],
          [30, 18],
        ],
        BLACK
      ),
      // The red crest: parasol, wings and crescent.
      pixels(
        11,
        5,
        [
          "...rr...",
          "..rrrr..",
          "...rr...",
          "r..rr..r",
          "rr.rr.rr",
          ".r....r.",
          "..rrrr..",
        ],
        { r: "#cf1126" }
      ),
    ],
  },
  bulgaria: { layers: hstripes([WHITE, "#00966e", "#d62612"]) },
  "burkina-faso": {
    layers: [hstripes(["#ef2b2d", "#009e49"]), star(15, 10, 3.6, "#fcd116")],
  },
  burundi: {
    layers: [
      fill("#ce1126"),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        "#1eb53a"
      ),
      poly(
        [
          [30, 0],
          [15, 10],
          [30, 20],
        ],
        "#1eb53a"
      ),
      saltire(3.5, WHITE),
      circle(15, 10, 5, WHITE),
      star(15, 7.6, 1.4, "#ce1126", { points: 6, weight: 4 }),
      star(12.8, 11.5, 1.4, "#ce1126", { points: 6, weight: 4 }),
      star(17.2, 11.5, 1.4, "#ce1126", { points: 6, weight: 4 }),
    ],
  },
  "cabo-verde": {
    layers: [
      hstripes(
        ["#003893", WHITE, "#cf2027", WHITE, "#003893"],
        [6, 1, 1, 1, 3]
      ),
      starRing(11.25, 11.67, 5, 10, 1.1, "#f7d116", { weight: 4 }),
    ],
  },
  cambodia: {
    layers: [
      hstripes(["#032ea1", "#e00025", "#032ea1"], [1, 2, 1]),
      // Angkor Wat.
      pixels(
        8,
        7,
        [
          ".....ww.....",
          "..w..ww..w..",
          "..w.wwww.w..",
          ".wwwwwwwwww.",
          ".wwwwwwwwww.",
          "wwwwwwwwwwww",
        ],
        { w: WHITE }
      ),
    ],
  },
  cameroon: {
    layers: [
      vstripes(["#007a5e", "#ce1126", "#fcd116"]),
      star(15, 10, 2.6, "#fcd116"),
    ],
  },
  canada: {
    layers: [
      vstripes(["#d52b1e", WHITE, "#d52b1e"], [1, 2, 1]),
      // The maple leaf.
      pixels(
        9,
        4,
        [
          "....rr....",
          "...rrrr...",
          "r..rrrr..r",
          "rr.rrrr.rr",
          ".rrrrrrrr.",
          "rrrrrrrrrr",
          ".rrrrrrrr.",
          "...rrrr...",
          "....rr....",
          "....rr....",
        ],
        { r: "#d52b1e" }
      ),
    ],
  },
  "central-african-republic": {
    layers: [
      hstripes(["#003082", WHITE, "#289728", "#ffce00"]),
      rect(12.5, 0, 5, 20, "#d21034"),
      star(5.5, 2.5, 1.9, "#ffce00"),
    ],
  },
  chad: { layers: vstripes(["#002664", "#fecb00", "#c60c30"]) },
  chile: {
    layers: [
      hstripes([WHITE, "#da291c"]),
      rect(0, 0, 10, 10, "#0033a0"),
      star(5, 5, 2.6, WHITE),
    ],
  },
  colombia: {
    layers: hstripes(["#fcd116", "#003893", "#ce1126"], [2, 1, 1]),
  },
  comoros: {
    layers: [
      hstripes(["#ffc61e", WHITE, "#ce1126", "#3a75c4"]),
      poly(
        [
          [0, 0],
          [12, 10],
          [0, 20],
        ],
        "#3d8e33"
      ),
      crescent(4.5, 10, 4, 6, 10, 3.3, WHITE),
      // Four stars beside the crescent.
      pixels(6, 6, ["w", ".", "w", ".", "w", ".", "w"], { w: WHITE }),
    ],
  },
  congo: {
    layers: [
      fill("#dc241f"),
      poly(
        [
          [0, 0],
          [22, 0],
          [0, 20],
        ],
        "#009543"
      ),
      poly(
        [
          [0, 20],
          [22, 0],
          [30, 0],
          [8, 20],
        ],
        "#fbde4a"
      ),
    ],
  },
  "costa-rica": {
    layers: hstripes(
      ["#002b7f", WHITE, "#ce1126", WHITE, "#002b7f"],
      [1, 1, 2, 1, 1]
    ),
  },
  "cote-divoire": { layers: vstripes(["#f77f00", WHITE, "#009e60"]) },
  croatia: {
    layers: [
      hstripes(["#ff0000", WHITE, "#171796"]),
      // The chequy shield under its crown.
      pixels(
        11,
        4,
        ["bbbbbb", "rwrwrw", "wrwrwr", "rwrwrw", "wrwrwr", ".rwrw.", "..wr.."],
        { b: "#3c7fd0", r: "#ff0000", w: WHITE }
      ),
    ],
  },
  cuba: {
    layers: [
      hstripes(["#002a8f", WHITE, "#002a8f", WHITE, "#002a8f"]),
      poly(
        [
          [0, 0],
          [13, 10],
          [0, 20],
        ],
        "#cf142b"
      ),
      star(4.5, 10, 2.8, WHITE),
    ],
  },
  cyprus: {
    layers: [
      fill(WHITE),
      // The island, panhandle to the north-east.
      poly(
        [
          [7.5, 9.5],
          [10.5, 7],
          [15, 7.5],
          [18.5, 6.5],
          [23, 4.5],
          [20.5, 7.5],
          [20, 9.5],
          [17, 11.5],
          [13, 12],
          [9.5, 11.5],
        ],
        "#d57800"
      ),
      // The olive branches.
      band(10.5, 14, 14.5, 15.5, 1.3, "#4e5b31"),
      band(19.5, 14, 15.5, 15.5, 1.3, "#4e5b31"),
    ],
  },
  czechia: {
    layers: [
      hstripes([WHITE, "#d7141a"]),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        "#11457e"
      ),
    ],
  },
  denmark: { layers: [fill("#c8102e"), cross(11, 10, 3, WHITE)] },
  djibouti: {
    layers: [
      hstripes(["#6ab2e7", "#12ad2b"]),
      poly(
        [
          [0, 0],
          [15, 10],
          [0, 20],
        ],
        WHITE
      ),
      star(5, 10, 2.2, "#d7141a"),
    ],
  },
  dominica: {
    layers: [
      fill("#006b3f"),
      // A cross of yellow, black and white stripes.
      rect(12.75, 0, 1.5, 20, "#fcd116"),
      rect(14.25, 0, 1.5, 20, BLACK),
      rect(15.75, 0, 1.5, 20, WHITE),
      rect(0, 7.75, 30, 1.5, "#fcd116"),
      rect(0, 9.25, 30, 1.5, BLACK),
      rect(0, 10.75, 30, 1.5, WHITE),
      // The red disc with its sisserou parrot.
      circle(15, 10, 4.6, "#d41c30"),
      pixels(13, 8, [".p", "pp", ".p"], { p: "#7a2d8b" }),
    ],
  },
};
