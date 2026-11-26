// Not a country: the comet the hedgehog carries home from orbit (it pairs with
// the space helmet). See ../draw.mjs for the DSL and ../helpers.mjs for `streak`.
import { fill, pixelDisc, pixelRect, pixels } from "../draw.mjs";
import { streak } from "../helpers.mjs";

const NIGHT = "#101538";
const [HOT, GOLD, ORANGE, RED] = ["#fff3b0", "#f9bd2b", "#f54e00", "#e3373f"];

export const flags = {
  comet: {
    layers: [
      fill(NIGHT),
      // A scatter of stars, bright and faint, kept clear of the comet.
      pixels(
        0,
        0,
        [
          ".....s...d..................s",
          ".............s....s..........",
          ".s....................s......",
          ".............................",
          ".....s....d.................d",
          ".............................",
          "................s............",
          "..s..........................",
          "......d...d..................",
          ".............................",
          ".............................",
          "...s........................s",
          ".............................",
          ".............................",
          "s.................s....d.....",
          ".............................",
          ".............................",
          "..........s....d.............",
          ".d..................d.....d..",
        ],
        { s: "#fff8f0", d: "#7d86bd" }
      ),
      // Three streaks fanning back toward the hoist, white-hot at the head.
      ...streak(19, 9, 3, 16, [HOT, GOLD, GOLD, ORANGE, ORANGE, RED]),
      ...streak(19, 10, 6, 17, [GOLD, GOLD, ORANGE, RED]),
      ...streak(18, 8, 7, 13, [GOLD, ORANGE, RED]),
      // The head: an orange glow, a gold ring and a white-hot core.
      pixelDisc(18, 4, 7, ORANGE),
      pixelDisc(19, 5, 5, GOLD),
      pixelRect(20, 6, 3, 3, HOT),
    ],
  },
};
