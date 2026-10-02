// Beyond the UN: partially recognised states, the UK home nations, and the EU
// and UN themselves.
// See ../draw.mjs for the DSL and ../helpers.mjs for shared emblems.
import {
  BLACK,
  MID_X,
  MID_Y,
  UK_RED,
  WHITE,
  fill,
  hstripes,
  pixelCrescent,
  pixelCross,
  pixelRect,
  pixelStar,
  pixelStarRing,
  pixels,
  poly,
  saltire,
} from "../draw.mjs";
import { EIGHT_RAY_SUN } from "../helpers.mjs";

export const flags = {
  england: {
    // Both arms 5px (the real cross is a fifth of the height), centred
    // exactly on the middle column and row.
    layers: [fill(WHITE), pixelCross(MID_X - 2, MID_Y - 2, 5, "#ce1124")],
  },
  "european-union": {
    layers: [
      fill("#003399"),
      // Twelve one-pixel stars in an even ring round the centre pixel.
      pixelStarRing(MID_X, MID_Y, 7, 12, "#ffcc00"),
    ],
  },
  kosovo: {
    layers: [
      fill("#244aa5"),
      // Six stars in an arc over the gold map, mirrored about the middle
      // column.
      pixels(
        MID_X - 8,
        2,
        ["......w...w......", "...w.........w...", "w...............w"],
        { w: WHITE }
      ),
      // The map: the northern spike up top, widening to the eastern bulge
      // and tapering down to Dragash at the bottom-left.
      pixels(
        MID_X - 5,
        6,
        [
          ".....g.....",
          "....ggg....",
          "...ggggg...",
          "..gggggggg.",
          "ggggggggggg",
          ".ggggggggg.",
          ".ggggggggg.",
          "..ggggggg..",
          "...ggg.g...",
          "...gg......",
          "...g......",
        ],
        { g: "#d0a650" }
      ),
    ],
  },
  "northern-ireland": {
    // St Patrick's Saltire: NI has had no official flag since 1972, and this
    // is its part of the Union Jack (deliberately not the Ulster Banner).
    layers: [fill(WHITE), saltire(3, UK_RED)],
  },
  scotland: { layers: [fill("#005eb8"), saltire(3.5, WHITE)] },
  taiwan: {
    layers: [
      fill("#fe0000"),
      // The canton: 15 columns and 9 rows, so the sun centres in it exactly.
      pixelRect(0, 0, 15, 9, "#000095"),
      // The white sun: rays around a blue ring.
      pixels(4, 1, EIGHT_RAY_SUN, { s: WHITE }),
      pixelRect(7, 4, 1, 1, "#000095"),
    ],
  },
  "united-nations": {
    layers: [
      fill("#4b92db"),
      // The polar-projection globe (a gridded disc) inside its wreath,
      // with the globe's centre on the middle pixel.
      pixels(
        MID_X - 5,
        MID_Y - 4,
        [
          "..w.....w..",
          ".w..www..w.",
          "w..wwwww..w",
          "w.ww.w.ww.w",
          "w.wwwwwww.w",
          "w.ww.w.ww.w",
          "w..wwwww..w",
          ".w..www..w.",
          "..ww...ww..",
          "....www....",
        ],
        { w: WHITE }
      ),
    ],
  },
  wales: {
    layers: [
      hstripes([WHITE, "#00b140"]),
      // Y Ddraig Goch, walking towards the hoist.
      pixels(
        MID_X - 7,
        4,
        [
          "........r.r.r..",
          ".rr.....rrrrr..",
          "rrrr...rrrrr...",
          ".rrr..rrrrr....",
          "..rrrrrrrrr...r",
          "...rrrrrrrrr.rr",
          "...rrrrrrrrrrr.",
          "...r.rr..rr....",
          "..rr.r..rr.....",
        ],
        { r: "#d30731" }
      ),
    ],
  },
  "western-sahara": {
    // The SADR flag, as the 🇪🇭 emoji shows it.
    layers: [
      hstripes([BLACK, WHITE, "#007a3d"]),
      poly(
        [
          [0, 0],
          [10, 10],
          [0, 20],
        ],
        "#c4111b"
      ),
      // The crescent and star, centred together on the white stripe.
      pixelCrescent(MID_X - 3, MID_Y - 2, 5, "#c4111b"),
      pixelStar(MID_X + 1, MID_Y - 1, "#c4111b", 3),
    ],
  },
};
