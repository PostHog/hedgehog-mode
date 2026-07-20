import { describe, expect, it } from "vitest";

import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOptions,
  HedgehogActorSkinOptions,
} from "../src/actors/hedgehog/config";

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
