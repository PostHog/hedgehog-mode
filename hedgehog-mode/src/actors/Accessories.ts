import { sample } from "lodash";

export type AccessoryInfo = {
  group: "headwear" | "eyewear" | "other";
};

export const HedgehogAccessories = {
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

export type HedgehogAccessory = keyof typeof HedgehogAccessories;

export const getRandomAccesoryCombo = (): HedgehogAccessory[] => {
  return [
    sample(
      Object.keys(HedgehogAccessories).filter(
        (accessory) => HedgehogAccessories[accessory].group === "headwear"
      ) as HedgehogAccessory[]
    ),
    sample(
      Object.keys(HedgehogAccessories).filter(
        (accessory) => HedgehogAccessories[accessory].group === "eyewear"
      ) as HedgehogAccessory[]
    ),
  ];
};
