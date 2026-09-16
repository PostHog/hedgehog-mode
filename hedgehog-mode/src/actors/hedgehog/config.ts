import { sample } from "../../misc/utils";
import type { HedgehogModeInterface } from "../../types";
import type { HedgehogActor } from "../Hedgehog";
import type { HedgehogSkinAbility } from "./abilities";
import { CatherineWheelAbility } from "./abilities";

export const HedgehogActorSkinOptions = [
  "default",
  "spiderhog",
  "robohog",
  "hogzilla",
  "ghost",
] as const;

export type HedgehogActorSkinOption = (typeof HedgehogActorSkinOptions)[number];

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
  /**
   * Rotation pivot, as a fraction of the frame. Accessory art is drawn in the
   * hedgehog's own frame so the two overlay, which leaves the frame mostly
   * empty — so anything that spins has to name where its art actually is.
   */
  spinAnchor?: { x: number; y: number };
  /** Builds the ability this accessory grants its wearer, if any. */
  createAbility?: (
    actor: HedgehogActor,
    game: HedgehogModeInterface,
    // Not the key union: that's derived from this registry, so naming it here
    // makes the type circular.
    accessory: string
  ) => HedgehogSkinAbility;
};

export const HedgehogActorAccessories = {
  beret: {
    group: "headwear",
  },
  cap: {
    group: "headwear",
  },
  "catherine-wheel": {
    group: "other",
    // The wheel is a 24px disc centred on (30, 44) of the 80px frame.
    spinAnchor: { x: 30 / 80, y: 44 / 80 },
    createAbility: (actor, game, accessory) =>
      new CatherineWheelAbility(actor, game, accessory),
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
} satisfies Record<string, HedgehogActorAccessoryInfo>;

type AccessoryKey = keyof typeof HedgehogActorAccessories;

/**
 * Accessories are restored from unvalidated storage, so an unknown key has to
 * read as empty rather than throw out of the actor constructor.
 */
export const getAccessoryInfo = (
  accessory: HedgehogActorAccessoryOption
): Partial<HedgehogActorAccessoryInfo> =>
  (HedgehogActorAccessories as Record<string, HedgehogActorAccessoryInfo>)[
    accessory
  ] ?? {};

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
  color?: HedgehogActorColorOption | null;
  accessories?: HedgehogActorAccessoryOption[];
  ai_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
  onClick?: () => void;
  friends?: Pick<
    HedgehogActorOptions,
    "id" | "accessories" | "color" | "skin"
  >[];
};
