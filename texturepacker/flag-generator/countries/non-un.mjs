// Beyond the UN: partially recognised states, the UK home nations, and the EU
// and UN themselves. See ../draw.mjs for the DSL.
import {
  BLACK,
  UK_RED,
  WHITE,
  crescent,
  cross,
  fill,
  hstripes,
  pixels,
  poly,
  rect,
  saltire,
  star,
} from "../draw.mjs";

export const flags = {
  england: { layers: [fill(WHITE), cross(15, 10, 4, "#ce1124")] },
  "european-union": {
    layers: [
      fill("#003399"),
      // Twelve one-pixel stars: anything bigger touches its neighbours.
      pixels(
        0,
        0,
        Array.from({ length: 19 }, (_, y) =>
          Array.from({ length: 28 }, (_, x) =>
            Array.from({ length: 12 }, (_, i) => i).some((i) => {
              const angle = (i * Math.PI) / 6;
              return (
                Math.round(13.5 + 6.5 * Math.sin(angle)) === x &&
                Math.round(9 - 6.5 * Math.cos(angle)) === y
              );
            })
              ? "y"
              : "."
          ).join("")
        ),
        { y: "#ffcc00" }
      ),
    ],
  },
  kosovo: {
    layers: [
      fill("#244aa5"),
      // Six stars in an arc over the gold map.
      pixels(7, 3, ["...w.w..w.w...", ".w..........w."], {
        w: WHITE,
      }),
      pixels(
        9,
        6,
        [
          "...gg.....",
          "..ggggg...",
          ".gggggggg.",
          "gggggggggg",
          ".ggggggggg",
          "..gggggggg",
          "...gggggg.",
          "....ggg...",
          ".....g....",
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
      rect(0, 0, 15, 10, "#000095"),
      // The white sun: rays around a blue ring.
      pixels(
        4,
        1,
        [
          "...w...",
          ".w.w.w.",
          "..www..",
          "wwwbwww",
          "..www..",
          ".w.w.w.",
          "...w...",
        ],
        { w: WHITE, b: "#000095" }
      ),
    ],
  },
  "united-nations": {
    layers: [
      fill("#4b92db"),
      // The polar-projection globe (a gridded disc) inside its wreath.
      pixels(
        9,
        4,
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
        6,
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
      crescent(14.6, 10, 2.5, 15.6, 10, 2.1, "#c4111b"),
      star(17.6, 10, 1.6, "#c4111b"),
    ],
  },
};
