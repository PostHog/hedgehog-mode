import { describe, expect, it } from "vitest";

import { EMBER_POOL, EmberField } from "../src/items/EmberField";
import { fakeGame, tick } from "./pyro-helpers";

vi.mock("pixi.js", () => {
  class FakeContainer {
    children: unknown[] = [];
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
    visible = false;
    tint = 0xffffff;
    rotation = 0;
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
    fill() {
      return this;
    }
  }
  return {
    Container: FakeContainer,
    Sprite: FakeSprite,
    Graphics: FakeGraphics,
    Texture: class {},
  };
});

function makeField() {
  const game = fakeGame();
  const field = new EmberField(game as never);
  return { game, field };
}

describe("EmberField", () => {
  it("shows exactly the embers requested", () => {
    const { field } = makeField();
    field.emitEmbers({ x: 0, y: 0 }, 10);
    expect(field.liveEmbers()).toBe(10);
  });

  it("kills every ember after their longest life", () => {
    const { field } = makeField();
    field.emitEmbers({ x: 0, y: 0 }, 10);
    tick(field as never, 3);
    expect(field.liveEmbers()).toBe(0);
  });

  it("recycles instead of growing past the pool", () => {
    const { field } = makeField();
    field.emitEmbers({ x: 0, y: 0 }, EMBER_POOL + 10);
    expect(field.totalEmbers()).toBe(EMBER_POOL);
    expect(field.liveEmbers()).toBe(EMBER_POOL);
  });

  it("drops embers with gravity and lifts smoke", () => {
    const { field } = makeField();
    field.emitEmbers({ x: 0, y: 0 }, 1, { vx: [0, 0], vy: [0, 0] });
    const ember = field.firstLiveEmber()!;
    const emberY = ember.sprite.position.y;
    field.update({ deltaMS: 100, deltaTime: 0.1 });
    expect(ember.sprite.position.y).toBeGreaterThan(emberY);

    field.emitSmoke({ x: 0, y: 0 }, 1, { vx: [0, 0], vy: [-50, -50] });
    const smoke = field.firstLiveSmoke()!;
    const smokeY = smoke.sprite.position.y;
    field.update({ deltaMS: 100, deltaTime: 0.1 });
    expect(smoke.sprite.position.y).toBeLessThan(smokeY);
  });
});
