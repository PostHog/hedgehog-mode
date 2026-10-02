// Afghanistan → Dominica.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  INTERIOR_WIDTH,
  MID_X,
  MID_Y,
  WHITE,
  ensign,
  fill,
  hstripes,
  mirrorHalves,
  pixelCrescent,
  pixelCross,
  pixelDisc,
  pixelHoistTriangle,
  pixelRect,
  pixelRing,
  pixelStar,
  pixels,
  poly,
  rect,
  saltire,
  vstripes,
} from "../draw.mjs";
import { COMMONWEALTH_STAR, SMALL_SUN, centred, chequy } from "../helpers.mjs";

export const flags = {
  afghanistan: {
    layers: [
      vstripes([BLACK, "#be0000", "#007a36"]),
      // The mosque-in-a-wreath emblem, as a white ring with a mihrab,
      // centred on the middle of the red stripe.
      pixelRing(MID_X - 3, 6, 7, 1, WHITE),
      pixels(MID_X - 1, 8, [".w.", "www", "www"], { w: WHITE }),
    ],
  },
  albania: {
    layers: [
      fill("#e41e20"),
      // The double-headed eagle: two heads looking outwards over the wings,
      // feathers fanned out at the wing tips, tail and talons below.
      pixels(
        MID_X - 7,
        4,
        mirrorHalves(
          [
            "......b.",
            ".....bb.",
            "b.b.b.bb",
            "bbbbb.bb",
            "bbbbbbbb",
            ".bbbbbbb",
            "..bbbbbb",
            "b..bbbbb",
            ".b..bbbb",
            "....bb.b",
            "...b..bb",
            "......b.",
          ],
          { odd: true }
        ),
        { b: BLACK }
      ),
    ],
  },
  algeria: {
    layers: [
      vstripes(["#006233", WHITE]),
      // The crescent centred on the middle of the flag, the star in its mouth.
      pixelCrescent(MID_X - 4, 5, 9, "#d21034"),
      pixelStar(MID_X + 2, 7, "#d21034", 5),
    ],
  },
  andorra: {
    layers: [
      vstripes(["#10069f", "#fedf00", "#d50032"], [8, 9, 8]),
      // The coat of arms, as a small shield.
      pixels(MID_X - 2, 7, ["ooooo", "orrro", "orrro", ".ooo."], {
        o: "#8a5a1c",
        r: "#d50032",
      }),
    ],
  },
  angola: {
    layers: [
      hstripes(["#cc092f", BLACK]),
      // As on the emblem: half a cog wheel arcing from the top round the fly
      // side to the bottom left, teeth out; the star in its opening at the top
      // left; and the machete, tip on the hoist side, sweeping down through the
      // bottom of the cog to its handle out at the bottom right.
      pixels(
        MID_X - 6,
        MID_Y - 6,
        [
          "......y.y.y..",
          ".....yyyyyy..",
          "..y......yyyy",
          ".yyy......yy.",
          "..y.......yyy",
          "y..........yy",
          "yy.........yy",
          ".yy.......yyy",
          "..yyy....yyy.",
          "....yy.yyy...",
          "......yyy....",
          "yyyyyyy.yy...",
          ".y.y.y...yyy.",
        ],
        { y: "#ffcb00" }
      ),
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
      // The rising sun, a dome on the horizon.
      centred(5, [2, 3, 4, 4], "#fcd116"),
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
      // The Sun of May: a disc with rays, centred.
      pixels(MID_X - 2, 7, SMALL_SUN, { s: "#f6b40e" }),
    ],
  },
  armenia: { layers: hstripes(["#d90012", "#0033a0", "#f2a800"]) },
  australia: {
    // The Commonwealth Star under the canton, and the Southern Cross: Alpha,
    // Beta, Gamma and Delta, plus little Epsilon.
    layers: ensign(
      "#00008b",
      // The seven-pointed Commonwealth Star, centred under the canton.
      pixels(4, 11, COMMONWEALTH_STAR, { s: WHITE }),
      // The Southern Cross as 3px stars, with little Epsilon a single pixel.
      pixelStar(21, 2, WHITE, 3),
      pixelStar(17, 7, WHITE, 3),
      pixelStar(24, 6, WHITE, 3),
      pixelStar(21, 15, WHITE, 3),
      pixelRect(23, 11, 1, 1, WHITE)
    ),
  },
  austria: { layers: hstripes(["#c8102e", WHITE, "#c8102e"]) },
  azerbaijan: {
    layers: [
      hstripes(["#00b5e2", "#ef3340", "#509e2f"]),
      pixelCrescent(11, 7, 5, WHITE, { bite: 0.8, shift: 0.25 }),
      // The eight-pointed star, in the crescent's mouth.
      pixelStar(15, 8, WHITE, 3),
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
      // The white hoist with five identical serrations, tips on rows 1, 5, 9,
      // 13 and 17, so the edge is symmetric about the middle row.
      pixels(
        0,
        0,
        Array.from({ length: 19 }, (_, y) => "w".repeat([9, 11, 9, 7][y % 4])),
        { w: WHITE }
      ),
    ],
  },
  bangladesh: {
    // The disc sits a little towards the hoist: 13px across, centred on
    // column 13 (45% of the way along, as on the real flag) and the middle row.
    layers: [fill("#006a4e"), pixelDisc(MID_X - 7, 3, 13, "#f42a41")],
  },
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
      // The coat of arms in its wreath, centred.
      pixelDisc(MID_X - 5, 4, 11, WHITE),
      pixelRing(MID_X - 5, 4, 11, 1, "#4b8a3c"),
      // Inside it, the arms in miniature: the mahogany tree on top, the
      // shield (gold over the blue sea) and a woodcutter either side.
      pixels(
        MID_X - 3,
        MID_Y - 3,
        [
          "..ggg..",
          ".ggggg.",
          "h..t..d",
          "byyyyyd",
          "byyyyyd",
          "b.ccc.d",
          "b..c..d",
        ],
        {
          g: "#2e7d32",
          t: "#6d4c2f",
          h: "#a0522d",
          b: "#a0522d",
          d: "#5c3317",
          y: "#e8b917",
          c: "#3d7cc9",
        }
      ),
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
      // The thunder dragon snaking up the diagonal in a gentle S: its tail
      // curling low at the hoist, a spined back, claws reaching down into the
      // orange with their jewels, and the head raised at the fly.
      pixels(
        0,
        0,
        [
          ".............................",
          "....................w.w......",
          "....................wwwww....",
          "...................wwwwbww...",
          "..................wwwwwwww...",
          "................wwwwww.ww....",
          "..............wwwwww..w..w...",
          ".............www.......ww....",
          "............ww.........ww....",
          "...........ww................",
          "..........ww.................",
          "..........ww.w...............",
          ".......w.ww...www............",
          "........ww......w............",
          ".......www...................",
          "...wwww...www................",
          "............w................",
          ".............................",
          ".............................",
        ],
        { w: WHITE, b: BLACK }
      ),
    ],
  },
  bolivia: { layers: hstripes(["#d52b1e", "#f9e300", "#007934"]) },
  "bosnia-and-herzegovina": {
    layers: [
      fill("#002395"),
      // The triangle's hypotenuse runs at exactly 45° in pixels, so the
      // stars beside it can step evenly: three rows down, three across.
      // It spans columns 5-23, so the blue either side is even.
      pixels(
        5,
        0,
        Array.from(
          { length: 19 },
          (_, y) => ".".repeat(y) + "y".repeat(19 - y)
        ),
        { y: "#fecb00" }
      ),
      // Seven stars, centred on rows 0, 3, ... 18; the end ones are cut by
      // the edges, as on the real flag.
      ...[0, 3, 6, 9, 12, 15, 18].map((y) => pixelStar(y + 1, y - 1, WHITE, 3)),
    ],
  },
  botswana: {
    layers: hstripes(
      ["#75aadb", WHITE, BLACK, WHITE, "#75aadb"],
      [8, 1.5, 3.5, 1.5, 8]
    ),
  },
  brazil: {
    // The rhombus comes to sharp points a pixel in from every edge, the globe
    // sits in it, and the band arcs across the globe: highest just left of
    // the middle, dropping away to the fly side, as on the real flag.
    layers: [
      fill("#009c3b"),
      centred(2, [1, 3, 4, 6, 8, 10, 11, 13, 11, 10, 8, 6, 4, 3, 1], "#ffdf00"),
      centred(4, [2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2], "#002776"),
      pixels(
        MID_X - 5,
        7,
        [
          ".wwwww.....",
          "wwwwwwww...",
          "......wwww.",
          "........www",
          "..........w",
        ],
        { w: WHITE }
      ),
    ],
  },
  brunei: {
    layers: [
      fill("#f7e017"),
      // White and black bands, hoist-top to fly-bottom, dropping one row
      // every two columns so the staircase is even; the black band ends in
      // the bottom fly corner.
      pixels(
        0,
        0,
        Array.from({ length: 19 }, (_, y) =>
          Array.from({ length: INTERIOR_WIDTH }, (_, x) => {
            const top = Math.floor(x / 2);
            return y >= top && y < top + 3
              ? "w"
              : y >= top + 3 && y < top + 5
                ? "k"
                : ".";
          }).join("")
        ),
        { w: WHITE, k: BLACK }
      ),
      // The red crest: the parasol on its staff, the raised hands and wings,
      // and the crescent cradling it all as a round bowl.
      pixels(
        MID_X - 5,
        MID_Y - 5,
        mirrorHalves(
          [
            "...rrr",
            ".....r",
            "r....r",
            "rr..rr",
            ".rr.rr",
            "..r..r",
            "r...rr",
            "rr...r",
            ".rr...",
            "..rrrr",
          ],
          { odd: true }
        ),
        { r: "#cf1126" }
      ),
    ],
  },
  bulgaria: { layers: hstripes([WHITE, "#00966e", "#d62612"]) },
  "burkina-faso": {
    layers: [
      hstripes(["#ef2b2d", "#009e49"]),
      pixelStar(MID_X - 3, 6, "#fcd116", 7),
    ],
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
      // The disc and its three stars in a triangle, centred.
      pixelDisc(MID_X - 5, 4, 11, WHITE),
      pixelStar(MID_X - 1, 6, "#ce1126", 3),
      pixelStar(MID_X - 3, 10, "#ce1126", 3),
      pixelStar(MID_X + 1, 10, "#ce1126", 3),
    ],
  },
  "cabo-verde": {
    layers: [
      hstripes(
        ["#003893", WHITE, "#cf2027", WHITE, "#003893"],
        [6, 1, 1, 1, 3]
      ),
      // The ring of ten stars as little dashes, centred on column 10 and the
      // red stripe, symmetric both ways.
      pixels(
        5,
        5,
        [
          ".....y.....",
          "..y..y..y..",
          "..yy...yy..",
          "...........",
          "yy.......yy",
          "...........",
          "...........",
          "yy.......yy",
          "...........",
          "..yy...yy..",
          "..y..y..y..",
          ".....y.....",
        ],
        { y: "#f7d116" }
      ),
    ],
  },
  cambodia: {
    layers: [
      hstripes(["#032ea1", "#e00025", "#032ea1"], [1, 2, 1]),
      // Angkor Wat.
      pixels(
        MID_X - 6,
        7,
        [
          ".....www.....",
          "..w..www..w..",
          "..w.wwwww.w..",
          ".wwwwwwwwwww.",
          ".wwwwwwwwwww.",
          "wwwwwwwwwwwww",
        ],
        { w: WHITE }
      ),
    ],
  },
  cameroon: {
    layers: [
      vstripes(["#007a5e", "#ce1126", "#fcd116"]),
      pixelStar(MID_X - 2, 7, "#fcd116", 5),
    ],
  },
  canada: {
    layers: [
      vstripes(["#d52b1e", WHITE, "#d52b1e"], [1, 2, 1]),
      // The maple leaf, kept to its three lobes: the tall centre one and a
      // side lobe angling up either side, over a broad base and the stem.
      pixels(
        MID_X - 5,
        MID_Y - 5,
        [
          ".....r.....",
          "....rrr....",
          "....rrr....",
          ".r..rrr..r.",
          ".rr.rrr.rr.",
          ".rrrrrrrrr.",
          "rrrrrrrrrrr",
          ".rrrrrrrrr.",
          "...rrrrr...",
          ".....r.....",
          ".....r.....",
        ],
        { r: "#d52b1e" }
      ),
    ],
  },
  "central-african-republic": {
    layers: [
      hstripes(["#003082", WHITE, "#289728", "#ffce00"]),
      // Whole pixels, so the stripe boundaries can't nudge it a column wider:
      // 5px, as wide as a stripe is tall, on the middle column.
      pixelRect(MID_X - 2, 0, 5, 19, "#d21034"),
      pixelStar(4, 1, "#ffce00", 3),
    ],
  },
  chad: { layers: vstripes(["#002664", "#fecb00", "#c60c30"]) },
  chile: {
    layers: [
      fill(WHITE),
      pixelRect(0, 9, INTERIOR_WIDTH, 10, "#da291c"),
      // A square canton with the star dead centre.
      pixelRect(0, 0, 9, 9, "#0033a0"),
      pixelStar(2, 2, WHITE, 5),
    ],
  },
  china: {
    layers: [
      fill("#ee1c25"),
      pixelStar(1, 1, "#ffff00", 7),
      // The four small stars, an arc facing the big one at the real flag's
      // positions; at a third of its size they're single bright pixels.
      pixels(9, 1, ["s", "", "..s", "", "", "..s", "", "s"], { s: "#ffff00" }),
    ],
  },
  colombia: {
    layers: hstripes(["#fcd116", "#003893", "#ce1126"], [2, 1, 1]),
  },
  comoros: {
    layers: [
      hstripes(["#ffc61e", WHITE, "#ce1126", "#3a75c4"]),
      // The hoist triangle in whole pixels: straight 45° edges meeting in a
      // one-pixel point on the middle row.
      pixelHoistTriangle(13, "#3d8e33"),
      // The crescent opening to the fly, a pixel off the hoist, with its four
      // stars stacked in the mouth, clear of the horns.
      pixelCrescent(1, MID_Y - 3, 7, WHITE),
      pixels(7, MID_Y - 3, ["w", "", "w", "", "w", "", "w"], { w: WHITE }),
    ],
  },
  congo: {
    // The band runs corner to corner: the green triangle loses 1px a row with
    // a 2px step on rows 4 and 13 (20px over 18 steps), so it reaches the
    // bottom hoist corner exactly, the band is 9px wide everywhere (it has to
    // be odd on a 29px cloth), and the red triangle is the green one turned
    // upside down.
    layers: [
      pixels(
        0,
        0,
        Array.from({ length: 19 }, (_, y) => {
          const green = [...Array(18).keys()]
            .filter((k) => k >= y)
            .reduce((sum, k) => sum + (k === 4 || k === 13 ? 2 : 1), 0);
          return "g".repeat(green) + "y".repeat(9) + "r".repeat(20 - green);
        }),
        { g: "#009543", y: "#fbde4a", r: "#dc241f" }
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
      // The crown of five small shields in a row above the chequy shield.
      pixels(MID_X - 5, MID_Y - 5, ["LLDDLLDDLL"], {
        L: "#3c7fd0",
        D: "#171796",
      }),
      pixels(MID_X - 5, MID_Y - 4, chequy(), { r: "#ff0000", w: WHITE }),
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
      pixelStar(2, 7, WHITE, 5),
    ],
  },
  cyprus: {
    layers: [
      fill(WHITE),
      // The island, its panhandle a long thin spike to the north-east and
      // Cape Arnauti a point to the west.
      poly(
        [
          [6.8, 9.9],
          [10.5, 7],
          [15, 7.5],
          [18.5, 6.4],
          [25, 3.4],
          [20.4, 7.7],
          [19.8, 9.6],
          [17, 11.5],
          [13, 12],
          [9.5, 11.5],
        ],
        "#d57800"
      ),
      // The olive branches, mirrored about the middle column.
      pixels(MID_X - 5, 13, ["oo.......oo", ".oooo.oooo."], { o: "#4e5b31" }),
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
  denmark: {
    // 12:4:21 along the length and 12:4:12 down, in whole pixels so both
    // arms are 3px.
    layers: [fill("#c8102e"), pixelCross(10, MID_Y - 1, 3, WHITE)],
  },
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
      pixelStar(3, 7, "#d7141a", 5),
    ],
  },
  dominica: {
    // Everything is centred on the middle pixel: the 1px yellow, black and
    // white stripes of the cross, the disc and the parrot.
    layers: [
      fill("#006b3f"),
      pixelRect(MID_X - 1, 0, 1, 19, "#fcd116"),
      pixelRect(MID_X, 0, 1, 19, BLACK),
      pixelRect(MID_X + 1, 0, 1, 19, WHITE),
      pixelRect(0, MID_Y - 1, INTERIOR_WIDTH, 1, "#fcd116"),
      pixelRect(0, MID_Y, INTERIOR_WIDTH, 1, BLACK),
      pixelRect(0, MID_Y + 1, INTERIOR_WIDTH, 1, WHITE),
      // The red disc with its sisserou parrot.
      pixelDisc(MID_X - 4, MID_Y - 4, 9, "#d41c30"),
      pixels(MID_X - 1, 7, [".pp", "ppp", ".pp", ".pp", ".p."], {
        p: "#7a2d8b",
      }),
    ],
  },
};
