import { sample } from "../../misc/utils";

export const HedgehogActorSkinOptions = [
  "default",
  "spiderhog",
  "robohog",
  "hogzilla",
  "ghost",
] as const;

export type HedgehogActorSkinOption = (typeof HedgehogActorSkinOptions)[number];

export const HedgehogActorFlagOptions = [
  "turkiye",
  "mexico",
  "italy",
  "france",
  "spain",
  "germany",
  "poland",
  "japan",
  "south-korea",
  "china",
  "brazil",
  "earth",
] as const;

export type HedgehogActorFlagOption = (typeof HedgehogActorFlagOptions)[number];

/**
 * Something the hedgehog holds — a flag on a pole, or the globe — on top of
 * whatever skin it's wearing. Animates from `props/<flag>/tile`; the
 * customization menu shows `icons/<flag>.png`.
 *
 * Mirrored flags ship pre-flipped `props/<flag>-left` frames: the engine
 * mirrors the hedgehog when it faces left, which would otherwise read a flag
 * backwards.
 */
export const HedgehogActorFlags: Record<
  HedgehogActorFlagOption,
  { mirrored: boolean }
> = {
  turkiye: { mirrored: true },
  mexico: { mirrored: true },
  italy: { mirrored: true },
  france: { mirrored: true },
  spain: { mirrored: true },
  germany: { mirrored: false },
  poland: { mirrored: false },
  japan: { mirrored: false },
  "south-korea": { mirrored: true },
  china: { mirrored: true },
  brazil: { mirrored: true },
  earth: { mirrored: true },
};

export const HedgehogActorColorOptions = [
  "green",
  "red",
  "blue",
  "purple",
  "dark",
  "light",
  "greyscale",
  "sepia",
  "invert",
  "rainbow",
] as const;

export type HedgehogActorColorOption =
  (typeof HedgehogActorColorOptions)[number];

export type HedgehogActorAccessoryInfo = {
  group: "headwear" | "eyewear" | "other";
};

export const HedgehogActorAccessories = {
  beret: {
    group: "headwear",
  },
  cap: {
    group: "headwear",
  },
  chef: {
    group: "headwear",
  },
  cowboy: {
    group: "headwear",
  },
  eyepatch: {
    group: "eyewear",
  },
  flag: {
    group: "headwear",
  },
  glasses: {
    group: "eyewear",
  },
  graduation: {
    group: "headwear",
  },

  parrot: {
    group: "other",
  },
  party: {
    group: "headwear",
  },
  pineapple: {
    group: "headwear",
  },
  sunglasses: {
    group: "eyewear",
  },
  tophat: {
    group: "headwear",
  },
  "xmas-hat": {
    group: "headwear",
  },
  "xmas-antlers": {
    group: "headwear",
  },
  "xmas-scarf": {
    group: "other",
  },
};

type AccessoryKey = keyof typeof HedgehogActorAccessories;

export type HedgehogActorAccessoryOption = AccessoryKey;
export const HedgehogActorAccessoryOptions = Object.keys(
  HedgehogActorAccessories
) as HedgehogActorAccessoryOption[];

export const getRandomAccessoryCombo = (): HedgehogActorAccessoryOption[] => {
  return [
    sample(
      Object.keys(HedgehogActorAccessories).filter(
        (accessory) =>
          HedgehogActorAccessories[accessory as AccessoryKey].group ===
          "headwear"
      ) as HedgehogActorAccessoryOption[]
    ),
    sample(
      Object.keys(HedgehogActorAccessories).filter(
        (accessory) =>
          HedgehogActorAccessories[accessory as AccessoryKey].group ===
          "eyewear"
      ) as HedgehogActorAccessoryOption[]
    ),
    sample([
      ...(Object.keys(HedgehogActorAccessories).filter(
        (accessory) =>
          HedgehogActorAccessories[accessory as AccessoryKey].group === "other"
      ) as HedgehogActorAccessoryOption[]),
      // A few undefined to make it less likely to have the other accessories
      undefined,
      undefined,
      undefined,
      undefined,
    ]),
  ].filter((accessory) => accessory !== undefined);
};

export type HedgehogActorOptions = {
  id: string;
  player?: boolean;
  skin?: HedgehogActorSkinOption | null;
  flag?: HedgehogActorFlagOption | null;
  color?: HedgehogActorColorOption | null;
  accessories?: HedgehogActorAccessoryOption[];
  ai_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
  onClick?: () => void;
  friends?: Pick<
    HedgehogActorOptions,
    "id" | "accessories" | "color" | "skin" | "flag"
  >[];
};
