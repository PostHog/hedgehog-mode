import { describe, expect, it } from "vitest";

import {
  getRandomAccessoryCombo,
  HedgehogActorAccessories,
  HedgehogActorAccessoryOptions,
  HedgehogActorFlagInfo,
  HedgehogActorFlagOptions,
  HedgehogActorFlags,
  HedgehogActorSkinOptions,
  searchFlags,
} from "../src/actors/hedgehog/config";
import sprites from "../assets/sprites.json";

const ofKind = (kind: HedgehogActorFlagInfo["kind"]) =>
  HedgehogActorFlagOptions.filter(
    (flag) => HedgehogActorFlags[flag].kind === kind
  );

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
    for (const globe of ofKind("globe")) {
      expect(sprites.animations).toHaveProperty([`props/${globe}/tile`]);
      expect(sprites.frames).toHaveProperty([`icons/${globe}.png`]);
    }
    for (const flag of ofKind("flag")) {
      expect(sprites.frames).toHaveProperty([`flags/${flag}.png`]);
    }
  });

  it("has a flag entry for every flag sprite", () => {
    // The other direction: a cloth drawn and packed but never registered
    // would ship in everyone's spritesheet with no way to pick it.
    const cloths = Object.keys(sprites.frames)
      .filter((name) => name.startsWith("flags/"))
      .map((name) => name.slice("flags/".length, -".png".length));
    expect(cloths.sort()).toEqual(ofKind("flag").sort());
  });

  it("has every flag once", () => {
    // 193 UN members + 2 observers + Taiwan, Kosovo, Western Sahara + 4 home
    // nations + the EU and UN + 37 territories with flags of their own.
    const flags = ofKind("flag");
    expect(flags).toHaveLength(241);
    const codes = flags.flatMap((flag) => {
      const info: HedgehogActorFlagInfo = HedgehogActorFlags[flag];
      return info.code ?? [];
    });
    // Everything but the UN has a code, and no two share one.
    expect(new Set(codes).size).toBe(240);
  });

  describe("searchFlags", () => {
    it.each([
      ["us", "united-states"],
      ["gb", "united-kingdom"],
      // An exact alias beats a country that merely starts with it (Ukraine).
      ["uk", "united-kingdom"],
      ["uae", "united-arab-emirates"],
      ["holland", "netherlands"],
      ["turkey", "turkiye"],
      ["ivory coast", "cote-divoire"],
      ["sao tome", "sao-tome-and-principe"],
      ["  Côte  ", "cote-divoire"],
      ["planet", "earth"],
      ["tw", "taiwan"],
      ["scotland", "scotland"],
      ["eu", "european-union"],
      ["macao", "macau"],
    ])("puts %j's flag first", (query, flag) => {
      expect(searchFlags(query)[0]).toBe(flag);
    });

    it("ranks names starting with the query above names containing it", () => {
      // "Oman" starts with "oman"; "Romania" only contains it.
      expect(searchFlags("oman")).toEqual(["oman", "romania"]);
    });

    it("finds both Koreas by a later word", () => {
      expect(searchFlags("korea")).toEqual(["south-korea", "north-korea"]);
    });

    it("lists everything for an empty query and nothing for nonsense", () => {
      expect(searchFlags("")).toEqual(HedgehogActorFlagOptions);
      expect(searchFlags("hogwarts")).toEqual([]);
    });
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
