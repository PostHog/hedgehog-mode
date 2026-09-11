import { describe, expect, it, vi } from "vitest";

import { WorldFx } from "../src/items/WorldFx";
import { fakeApp } from "./pyro-helpers";

vi.mock("pixi.js", () => {
  class FakeContainer {
    children: unknown[] = [];
    x = 0;
    y = 0;
    position = {
      x: 0,
      y: 0,
      set(x: number, y: number) {
        this.x = x;
        this.y = y;
      },
    };
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
    addChildAt(child: unknown, index: number) {
      this.children.splice(index, 0, child);
      return child;
    }
    setChildIndex(child: unknown, index: number) {
      const current = this.children.indexOf(child);
      if (current >= 0) {
        this.children.splice(current, 1);
        this.children.splice(index, 0, child);
      }
    }
    destroy() {}
  }
  class ColorMatrixFilter {
    contrast() {}
    sepia() {}
    reset() {}
  }
  return { Container: FakeContainer, ColorMatrixFilter, Texture: class {} };
});

function makeWorldFx() {
  const app = fakeApp();
  const game = { app, elements: [] } as never;
  const worldFx = new WorldFx(game);
  return { app, worldFx };
}

describe("WorldFx", () => {
  it("offsets the stage for one frame per shake call", () => {
    const { app, worldFx } = makeWorldFx();
    worldFx.shake(2);
    worldFx.update({ deltaMS: 16, deltaTime: 1 / 60 });
    const moved = app.stage.position.x !== 0 || app.stage.position.y !== 0;
    expect(moved).toBe(true);

    worldFx.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(app.stage.position.x).toBe(0);
    expect(app.stage.position.y).toBe(0);
  });

  it("sets and clears the stage filter with the grade", () => {
    const { app, worldFx } = makeWorldFx();
    worldFx.setGrade(1);
    expect(app.stage.filters).toHaveLength(1);
    worldFx.setGrade(0);
    expect(app.stage.filters).toBeNull();
  });

  it("keeps the fx layer on top when a new child is appended", () => {
    const { app, worldFx } = makeWorldFx();
    app.stage.addChild({ late: true });
    worldFx.update({ deltaMS: 16, deltaTime: 1 / 60 });
    const children = app.stage.children as unknown[];
    expect(children[children.length - 1]).toBe(worldFx.fx);
  });

  it("resets the stage on unload", () => {
    const { app, worldFx } = makeWorldFx();
    worldFx.setGrade(1);
    worldFx.shake(2);
    worldFx.update({ deltaMS: 16, deltaTime: 1 / 60 });
    worldFx.beforeUnload();
    expect(app.stage.filters).toBeNull();
    expect(app.stage.position.x).toBe(0);
  });

  it("does not shake under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { app, worldFx } = makeWorldFx();
    worldFx.shake(2);
    worldFx.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(app.stage.position.x).toBe(0);
    expect(app.stage.position.y).toBe(0);
    vi.unstubAllGlobals();
  });
});
