import { describe, expect, it } from "vitest";

import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOptions,
  HedgehogActorFlagOptions,
  HedgehogActorFlags,
  HedgehogActorSkinOptions,
} from "../src/actors/hedgehog/config";
import sprites from "../assets/sprites.json";

describe("public hedgehog configuration", () => {
  it("exports the supported skins", () => {
    expect(HedgehogActorSkinOptions).toEqual([
      "default",
      "spiderhog",
      "robohog",
      "hogzilla",
      "ghost",
    ]);
  });

  it("ships sprites for every flag", () => {
    expect(HedgehogActorFlagOptions).toEqual(Object.keys(HedgehogActorFlags));
    expect(sprites.frames).toHaveProperty(["props/pole.png"]);
    for (const flag of HedgehogActorFlagOptions) {
      expect(sprites.frames).toHaveProperty([`icons/${flag}.png`]);
      if (HedgehogActorFlags[flag].kind === "globe") {
        expect(sprites.animations).toHaveProperty([`props/${flag}/tile`]);
      } else {
        expect(sprites.frames).toHaveProperty([`flags/${flag}.png`]);
      }
    }
  });

  it("exports every configured accessory", () => {
    expect(HedgehogActorAccessoryOptions).toEqual(
      Object.keys(HedgehogActorAccessories)
    );
  });

  it("generates valid accessory combinations", () => {
    const combinations = Array.from({ length: 100 }, () =>
      getRandomAccessoryCombo()
    );

    expect(
      combinations.every((combination) => {
        const groups = combination.map(
          (accessory) => HedgehogActorAccessories[accessory].group
        );

        return (
          combination.every((accessory) =>
            HedgehogActorAccessoryOptions.includes(accessory)
          ) && new Set(groups).size === groups.length
        );
      })
    ).toBe(true);
  });
});
