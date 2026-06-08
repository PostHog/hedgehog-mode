import { ColorMatrixFilter } from "pixi.js";
import { HedgehogActorColorOption } from "./config";

/**
 * Per-colour tweaks applied to a hedgehog's ColorMatrixFilter. "rainbow" is a
 * no-op here because it is animated over time by the actor (hue is advanced
 * each frame) rather than being a static transform.
 */
export const COLOR_TO_FILTER_MAP: Record<
  HedgehogActorColorOption,
  (filter: ColorMatrixFilter) => void
> = {
  red: (filter) => {
    filter.hue(350, true);
    filter.saturate(1.2, true);
    filter.brightness(0.9, true);
  },
  green: (filter) => {
    filter.hue(60, true);
    filter.saturate(1, true);
  },
  blue: (filter) => {
    filter.hue(210, true);
    filter.saturate(3, true);
    filter.brightness(0.9, true);
  },
  purple: (filter) => {
    filter.hue(240, true);
  },
  dark: (filter) => {
    filter.brightness(0.7, true);
  },
  light: (filter) => {
    filter.brightness(1.3, true);
  },
  sepia: (filter) => {
    filter.sepia(true);
  },
  invert: (filter) => {
    filter.negative(true);
  },
  greyscale: (filter) => {
    filter.grayscale(0.3, true);
  },
  rainbow: () => {},
};

/** Reset and apply the static colour transform for a non-animated colour. */
export function applyStaticColor(
  filter: ColorMatrixFilter,
  color: HedgehogActorColorOption | null | undefined
): void {
  filter.reset();
  if (color) {
    COLOR_TO_FILTER_MAP[color]?.(filter);
  }
}
