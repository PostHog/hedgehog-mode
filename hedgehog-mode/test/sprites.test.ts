import { describe, expect, it } from "vitest";

import sprites from "../assets/sprites.json";

describe("catherine wheel atlas frame", () => {
  it("is packed at 80x80 like every other accessory", () => {
    const frame = (sprites.frames as Record<string, { frame: { w: number; h: number } }>)[
      "accessories/catherine-wheel.png"
    ];

    expect(frame).toBeDefined();
    expect(frame.frame.w).toBe(80);
    expect(frame.frame.h).toBe(80);
  });

  it("fits inside the atlas the packer declares", () => {
    const frame = (sprites.frames as Record<string, { frame: { y: number; h: number } }>)[
      "accessories/catherine-wheel.png"
    ];

    expect(frame.frame.y + frame.frame.h).toBeLessThanOrEqual(sprites.meta.size.h);
    // The .tps caps the sheet at 2048x2048.
    expect(sprites.meta.size.h).toBeLessThanOrEqual(2048);
  });
});
