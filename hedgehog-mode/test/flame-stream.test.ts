import { afterEach, describe, expect, it, vi } from "vitest";

import { FlameStream } from "../src/items/FlameStream";
import { fakeGame } from "./pyro-helpers";

vi.mock("pixi.js", () => {
  class FakeContainer {
    children: unknown[] = [];
    blendMode = "normal";
    filters: unknown[] | null = null;
    addChild(child: unknown) {
      this.children.push(child);
      return child;
    }
    removeChild(child: unknown) {
      const index = this.children.indexOf(child);
      if (index >= 0) {
        this.children.splice(index, 1);
      }
      return child;
    }
    destroy() {}
  }
  class FakeSprite extends FakeContainer {
    alpha = 1;
    visible = true;
    renderable = true;
    tint = 0xffffff;
    rotation = 0;
    x = 0;
    y = 0;
    anchor = { set: () => undefined };
    scale = {
      x: 1,
      y: 1,
      set(x: number, y?: number) {
        this.x = x;
        this.y = y ?? x;
      },
    };
    position = {
      x: 0,
      y: 0,
      set(x: number, y: number) {
        this.x = x;
        this.y = y;
      },
    };
    constructor(public texture?: unknown) {
      super();
    }
  }
  class FakeGraphics extends FakeContainer {
    circle() {
      return this;
    }
    rect() {
      return this;
    }
    roundRect() {
      return this;
    }
    moveTo() {
      return this;
    }
    lineTo() {
      return this;
    }
    stroke() {
      return this;
    }
    fill() {
      return this;
    }
    clear() {
      return this;
    }
  }
  class DisplacementFilter {
    constructor(public options: unknown) {}
  }
  class ColorMatrixFilter {
    reset() {}
    contrast() {}
    multiplyColor() {}
  }
  return {
    Container: FakeContainer,
    Sprite: FakeSprite,
    Graphics: FakeGraphics,
    DisplacementFilter,
    ColorMatrixFilter,
    Texture: class {},
  };
});

import { getPyroTextures } from "../src/misc/textures";
import { WorldFx } from "../src/items/WorldFx";

function makeStream() {
  const game = fakeGame();
  game.worldFx = new WorldFx(game as never);
  const textures = getPyroTextures(game.app.renderer as never);
  const stream = new FlameStream(game as never, textures);
  return { game, stream };
}

describe("FlameStream", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("makes particles visible while emitting", () => {
    const { stream } = makeStream();
    stream.emit({ x: 100, y: 200 }, 1, 1 / 60);
    expect(stream.liveCount()).toBeGreaterThan(0);
  });

  it("lets every particle die when idle", () => {
    const { stream } = makeStream();
    stream.emit({ x: 100, y: 200 }, 1, 1 / 60);
    for (let i = 0; i < 200; i++) {
      stream.idle(1 / 60);
    }
    expect(stream.liveCount()).toBe(0);
  });

  it("never grows past the pool", () => {
    const { stream } = makeStream();
    for (let i = 0; i < 300; i++) {
      stream.emit({ x: 100, y: 200 }, 1, 1 / 60);
    }
    expect(stream.totalCount()).toBeLessThanOrEqual(220);
  });

  it("skips the shimmer filter under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { stream } = makeStream();
    expect(stream.container.filters ?? []).toHaveLength(0);
  });

  it("uses the shimmer filter when motion is fine", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const { stream } = makeStream();
    expect(stream.container.filters).toHaveLength(1);
  });

  it("removes its container and noise sprite on unload", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    const { game, stream } = makeStream();
    const fx = game.worldFx.fx as { children: unknown[] };
    expect(fx.children).toContain(stream.container);
    stream.beforeUnload();
    expect(fx.children).not.toContain(stream.container);
  });
});
