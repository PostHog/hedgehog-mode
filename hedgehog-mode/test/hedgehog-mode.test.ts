import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Runner } from "matter-js";

const loadCspSafePixiRenderer = vi.hoisted(() => vi.fn());

vi.mock("pixi.js/unsafe-eval", () => {
  loadCspSafePixiRenderer();
  return {};
});

import { HedgehogActor } from "../src/actors/Hedgehog";
import { HedgeHogMode } from "../src/hedgehog-mode";

// Mirrors the Pixi v8 behavior this library has to defend against:
// Application.destroy() throws when called before init() resolves
// (ResizePlugin isn't wired up yet) and when called a second time.
vi.mock("pixi.js", () => {
  class MockApplication {
    renderer: object | null = null;
    canvas = {};
    stage = {};
    screen = {};
    initCalls = 0;
    destroyCalls = 0;
    private resolveInit!: () => void;
    private initGate = new Promise<void>((resolve) => {
      this.resolveInit = resolve;
    });

    init = async (): Promise<void> => {
      this.initCalls++;
      await this.initGate;
      this.renderer = {};
    };

    destroy = (): void => {
      this.destroyCalls++;
      if (!this.renderer) {
        throw new Error("Pixi throws on destroy before init or double destroy");
      }
      this.renderer = null;
    };

    finishInit(): void {
      this.resolveInit();
    }
  }

  return {
    Application: MockApplication,
    AnimatedSprite: class {},
    Sprite: class {},
    Graphics: class {},
    ColorMatrixFilter: class {},
    Texture: class {},
    Spritesheet: class {},
    Assets: { load: async () => ({}) },
  };
});

type MockApp = {
  renderer: object | null;
  initCalls: number;
  destroyCalls: number;
  finishInit: () => void;
};

const config = { assetsUrl: "https://example.com/assets" };

function createHostRef() {
  const appendChild = vi.fn<(node: unknown) => void>();
  const ref = {
    appendChild,
    style: { setProperty: vi.fn<() => void>() },
    classList: { toggle: vi.fn<() => void>() },
  } as unknown as HTMLDivElement;
  return { ref, appendChild };
}

describe("HedgeHogMode lifecycle", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      devicePixelRatio: 1,
      // matter-js Runner.stop() reaches for these on destroy
      requestAnimationFrame: vi.fn<() => void>(),
      cancelAnimationFrame: vi.fn<() => void>(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads Pixi's CSP-safe renderer", () => {
    expect(loadCspSafePixiRenderer).toHaveBeenCalledOnce();
  });

  it("unloads every element when the game is destroyed", () => {
    const game = Object.create(HedgeHogMode.prototype) as HedgeHogMode;
    const first = { beforeUnload: vi.fn() };
    const second = { beforeUnload: vi.fn() };
    Object.assign(game, {
      elements: [first, second],
      runner: Runner.create(),
      teardownListeners: [],
    });

    game.destroy();

    expect(first.beforeUnload).toHaveBeenCalledOnce();
    expect(second.beforeUnload).toHaveBeenCalledOnce();
    expect(game.elements).toEqual([]);
  });

  it("keeps giant hedgehogs rampaging", () => {
    const actor = Object.create(HedgehogActor.prototype) as HedgehogActor;
    actor.sprite = { scale: { y: 2 } } as never;

    expect(actor.isRampaging).toBe(true);
  });

  it("defers app teardown when destroyed before Pixi init resolves", async () => {
    const game = new HedgeHogMode(config);
    const { ref, appendChild } = createHostRef();
    const load = vi.spyOn(game.spritesManager, "load").mockResolvedValue();

    const rendering = game.render(ref);
    const app = game.app as unknown as MockApp;

    expect(game.isDestroyed).toBe(false);
    game.destroy();
    expect(game.isDestroyed).toBe(true);
    expect(app.destroyCalls).toBe(0);

    app.finishInit();
    await rendering;

    expect(app.destroyCalls).toBe(1);
    expect(load).not.toHaveBeenCalled();
    expect(appendChild).not.toHaveBeenCalled();
  });

  it("destroys the app immediately when destroyed during the sprite load", async () => {
    const game = new HedgeHogMode(config);
    const { ref, appendChild } = createHostRef();
    const cleanup = vi.fn<() => void>();
    const element = {
      isInteractive: false,
      update: () => {},
      beforeUnload: cleanup,
    };
    game.elements.push(element);
    let resolveLoad!: () => void;
    const load = vi.spyOn(game.spritesManager, "load").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLoad = resolve;
        })
    );

    const rendering = game.render(ref);
    const app = game.app as unknown as MockApp;
    app.finishInit();
    await vi.waitFor(() => expect(load).toHaveBeenCalled());

    game.destroy();
    expect(app.destroyCalls).toBe(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(game.elements).toHaveLength(0);
    game.removeElement(element);
    expect(cleanup).toHaveBeenCalledTimes(1);

    resolveLoad();
    await rendering;

    expect(app.destroyCalls).toBe(1);
    expect(appendChild).not.toHaveBeenCalled();
  });

  it("ignores a second destroy()", async () => {
    const game = new HedgeHogMode(config);
    const { ref } = createHostRef();
    const load = vi
      .spyOn(game.spritesManager, "load")
      .mockImplementation(() => new Promise(() => {}));

    game.render(ref);
    const app = game.app as unknown as MockApp;
    app.finishInit();
    await vi.waitFor(() => expect(load).toHaveBeenCalled());

    game.destroy();
    game.destroy();

    expect(app.destroyCalls).toBe(1);
  });

  it("makes render() a no-op after destroy()", async () => {
    const game = new HedgeHogMode(config);
    const { ref } = createHostRef();
    const load = vi.spyOn(game.spritesManager, "load").mockResolvedValue();

    const rendering = game.render(ref);
    const app = game.app as unknown as MockApp;
    game.destroy();
    app.finishInit();
    await rendering;

    const secondRender = game.render(ref);
    expect(game.app as unknown as MockApp).toBe(app);
    await secondRender;

    expect(app.initCalls).toBe(1);
    expect(load).not.toHaveBeenCalled();
  });
});
