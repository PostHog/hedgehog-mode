/**
 * `props/pole.png` leans about a pixel right for every four rows down, so a
 * cloth hung square off it parts company with the pole halfway down. Instead
 * each band of cloth rows shifts right by `shift` whole pixels, tracing the
 * pole's staircase so the hoist stays on it — the cloth's own outline column
 * stands in for the pole's right edge. Whole-pixel bands rather than a smooth
 * skew, so the pixel art stays crisp.
 *
 * Covers the 21 rows of a cloth; redraw the pole and this goes with it.
 */
export const FLAG_CLOTH_BANDS = [
  { row: 0, height: 2, shift: 0 },
  { row: 2, height: 4, shift: 1 },
  { row: 6, height: 4, shift: 2 },
  { row: 10, height: 3, shift: 3 },
  { row: 13, height: 4, shift: 4 },
  { row: 17, height: 4, shift: 5 },
] as const;
