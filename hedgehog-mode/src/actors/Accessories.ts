export type AccessoryInfo = {
  group: "headwear" | "eyewear" | "other";
};

export const standardAccessories = {
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

export type HedgehogAccessory = keyof typeof standardAccessories;

const pickRandom = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomAccesoryCombo = (): HedgehogAccessory[] => {
  return [
    pickRandom(
      Object.keys(standardAccessories).filter(
        (accessory) => standardAccessories[accessory].group === "headwear"
      ) as HedgehogAccessory[]
    ),
    pickRandom(
      Object.keys(standardAccessories).filter(
        (accessory) => standardAccessories[accessory].group === "eyewear"
      ) as HedgehogAccessory[]
    ),
  ];
};
