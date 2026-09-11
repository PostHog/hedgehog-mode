import { describe, expect, it, vi } from "vitest";

import { MAX_SCORCH_MARKS, ScorchLayer } from "../src/items/ScorchLayer";
import { fakeGame, fakeRect, tick } from "./pyro-helpers";

vi.mock("pixi.js", () => {
  class FakeGraphics {
    clearCalls = 0;
    clear() {
      this.clearCalls++;
      return this;
    }
    ellipse() {
      return this;
    }
    circle() {
      return this;
    }
    fill() {
      return this;
    }
  }
  return { Graphics: FakeGraphics, Container: class {}, Texture: class {} };
});

function makeLayer() {
  const game = fakeGame();
  const layer = new ScorchLayer(game as never);
  return { game, layer };
}

describe("ScorchLayer", () => {
  it("caps the marks and drops the oldest", () => {
    const { layer } = makeLayer();
    for (let i = 0; i < MAX_SCORCH_MARKS + 1; i++) {
      layer.mark(fakeRect(i, 0, 40, 20), "left", 0.5);
    }
    expect(layer.markCount()).toBe(MAX_SCORCH_MARKS);
  });

  it("expires marks after twenty seconds and clears the layer", () => {
    const { layer } = makeLayer();
    layer.mark(fakeRect(0, 0, 40, 20), "left", 0.5);
    expect(layer.markCount()).toBe(1);
    tick(layer as never, 21);
    expect(layer.markCount()).toBe(0);
    expect(
      (layer.graphics as unknown as { clearCalls: number }).clearCalls
    ).toBeGreaterThan(0);
  });

  it("redraws nothing when there are no marks", () => {
    const { layer } = makeLayer();
    const clear = vi.spyOn(layer.graphics, "clear");
    layer.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(clear).not.toHaveBeenCalled();
  });
});
