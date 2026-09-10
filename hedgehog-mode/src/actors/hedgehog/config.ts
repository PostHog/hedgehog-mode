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
   * Accessories are cosmetic by default. One that supplies this grants its
   * wearer an active ability, built and torn down by
   * {@link HedgehogAccessoryAbilities} as it is equipped and removed.
   */
  createAbility?: (
    actor: HedgehogActor,
    game: HedgehogModeInterface
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
    createAbility: (actor: HedgehogActor, game: HedgehogModeInterface) =>
      new CatherineWheelAbility(actor, game),
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

/**
 * The ability factory a given accessory grants, if any. The registry is left
 * un-annotated so `AccessoryKey` stays a literal union, which means indexing it
 * gives a union where only some members declare `createAbility`. Reading it
 * through a partial view gets at that member without widening the registry, and
 * copes with a key that isn't in it at all: accessories are restored from
 * unvalidated storage, so an unknown one must yield no ability rather than
 * throw out of the actor constructor.
 */
export const getAccessoryAbilityFactory = (
  accessory: HedgehogActorAccessoryOption
): HedgehogActorAccessoryInfo["createAbility"] => {
  const info = HedgehogActorAccessories[accessory] as
    | Partial<HedgehogActorAccessoryInfo>
    | undefined;
  return info?.createAbility;
};

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
