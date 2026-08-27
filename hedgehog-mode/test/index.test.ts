import { describe, expect, it } from "vitest";

import {
  getAccessoryAbilityFactory,
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

  it("grants an ability factory only to accessories that declare one", () => {
    expect(getAccessoryAbilityFactory("catherine-wheel")).toBeTypeOf(
      "function"
    );
    expect(getAccessoryAbilityFactory("tophat")).toBeUndefined();
    // Accessories are read back from unvalidated storage, so a stale or
    // hand-edited key must degrade to "no ability" rather than throw out of the
    // actor constructor and take hedgehog mode down with it.
    expect(
      getAccessoryAbilityFactory("not-an-accessory" as never)
    ).toBeUndefined();
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
