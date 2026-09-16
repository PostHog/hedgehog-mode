import { describe, expect, it } from "vitest";

import sprites from "../assets/sprites.json";
import { getSpriteStyle } from "../src/static-renderer/StaticHedgehog";

describe("catherine wheel atlas frame", () => {
  it("is packed at 80x80 like every other accessory", () => {
    const frame = (
      sprites.frames as Record<string, { frame: { w: number; h: number } }>
    )["accessories/catherine-wheel.png"];

    expect(frame).toBeDefined();
    expect(frame.frame.w).toBe(80);
    expect(frame.frame.h).toBe(80);
  });

  it("fits inside the atlas the packer declares", () => {
    const frame = (
      sprites.frames as Record<string, { frame: { y: number; h: number } }>
    )["accessories/catherine-wheel.png"];

    expect(frame.frame.y + frame.frame.h).toBeLessThanOrEqual(
      sprites.meta.size.h
    );
    // The .tps caps the sheet at 2048x2048.
    expect(sprites.meta.size.h).toBeLessThanOrEqual(2048);
  });
});

describe("static renderer sprite cropping", () => {
  // The picker renders sprites as a scaled background image rather than through
  // pixi, so it needs the atlas dimensions. They used to be hardcoded, and when
  // the catherine wheel took the sheet 1440 -> 1520 every frame in the picker
  // started cropping against the wrong scale: the wheel showed up as the beret.
  it("puts the last row of the atlas inside the scaled sheet", () => {
    // The specific failure: a frame on a row that only exists in the grown sheet
    // lands outside a sheet scaled to the old height, and renders its neighbour.
    const style = getSpriteStyle(
      "accessories/catherine-wheel.png",
      "/assets"
    ) as { backgroundSize: string; backgroundPosition: string };

    const sheetPct = Number(
      style.backgroundSize.split(" ")[1].replace("%", "")
    );
    const offsetPct = Number(
      style.backgroundPosition.split(" ")[1].replace(/[-%]/g, "")
    );

    expect(offsetPct).toBeLessThan(sheetPct);
  });
});
