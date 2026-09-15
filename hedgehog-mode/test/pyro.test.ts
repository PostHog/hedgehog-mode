// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("pixi.js", () => {
  class FakeContainer {
    children: unknown[] = [];
    blendMode = "normal";
    filters: unknown[] | null = null;
    renderable = true;
    x = 0;
    y = 0;
    alpha = 1;
    visible = true;
    tint = 0xffffff;
    anchor = { set: () => undefined };
    position = {
      x: 0,
      y: 0,
      set(x: number, y: number) {
        this.x = x;
        this.y = y;
      },
    };
    scale = {
      x: 1,
      y: 1,
      set(x: number, y?: number) {
        this.x = x;
        this.y = y ?? x;
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
  class FakeSprite extends FakeContainer {
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

import { HedgehogActor } from "../src/actors/Hedgehog";
import {
  HedgehogPyro,
  PYRO_DURATION_MS,
  PYRO_RECOIL,
  PYRO_TRIGGER_HOLD_MS,
} from "../src/actors/hedgehog/pyro";
import { BurningElement } from "../src/items/BurningElement";
import { FlameStream } from "../src/items/FlameStream";
import { SyncedPlatform } from "../src/items/SyncedPlatform";
import { WorldFx } from "../src/items/WorldFx";
import { fakeGame, fakeRect } from "./pyro-helpers";

function makeActor(overrides: Record<string, unknown> = {}): HedgehogActor {
  const sprite = {
    x: 400,
    y: 300,
    width: 40,
    height: 40,
    scale: { x: 1, y: 1 },
    addChild: vi.fn(),
    removeChild: vi.fn(),
    toGlobal: (point: { x: number; y: number }) => ({
      x: 400 + point.x,
      y: 300 + point.y,
    }),
  };
  const actor = Object.assign(Object.create(HedgehogActor.prototype), {
    sprite,
    rigidBody: {
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
    },
    isDead: false,
    walkSpeed: 0,
    ai: { pause: vi.fn() },
    interface: { announcePyro: vi.fn() },
    setVelocity: vi.fn(),
    getDirection: () => "right" as const,
    holdPose: vi.fn(),
    updateSprite: vi.fn(),
    setOnFire: vi.fn(),
    ...overrides,
  });
  return actor as HedgehogActor;
}

function makePyro(
  actor: HedgehogActor,
  gameOverrides: Record<string, unknown> = {}
) {
  const game = fakeGame(gameOverrides);
  game.worldFx = new WorldFx(game as never);
  const pyro = new HedgehogPyro(actor, game as never);
  return { game, pyro };
}

function platformInCone() {
  const rect = fakeRect(500, 280, 100, 40);
  const ref = document.createElement("div");
  ref.getBoundingClientRect = () => rect;
  return Object.assign(Object.create(SyncedPlatform.prototype), {
    ref,
    lastRect: rect,
  }) as SyncedPlatform;
}

describe("HedgehogPyro", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("activates on start and ends after the duration", () => {
    const { pyro } = makePyro(makeActor());
    pyro.start();
    expect(pyro.isActive).toBe(true);
    vi.advanceTimersByTime(PYRO_DURATION_MS + 1);
    expect(pyro.isActive).toBe(false);
  });

  it("extends without replaying the intro when started twice", () => {
    const actor = makeActor();
    const { pyro } = makePyro(actor);
    pyro.start();
    vi.advanceTimersByTime(5000);
    pyro.start();
    expect(actor.holdPose).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(PYRO_DURATION_MS - 1);
    expect(pyro.isActive).toBe(true);
  });

  it("does nothing for a dead hog", () => {
    const actor = makeActor({ isDead: true });
    const { pyro } = makePyro(actor);
    pyro.start();
    expect(pyro.isActive).toBe(false);
    expect(actor.holdPose).not.toHaveBeenCalled();
  });

  it("ignores the trigger while inactive", () => {
    const actor = makeActor();
    const { pyro } = makePyro(actor);
    pyro.pullTrigger();
    expect(actor.setVelocity).not.toHaveBeenCalled();
  });

  it("recoils against the facing direction while active", () => {
    const actor = makeActor();
    const { pyro } = makePyro(actor);
    pyro.start();
    pyro.pullTrigger();
    expect(actor.setVelocity).toHaveBeenCalledWith({
      x: -PYRO_RECOIL,
      y: 0,
    });
  });

  it("ignites a platform inside the cone while the trigger is hot", () => {
    const ignite = vi.spyOn(BurningElement, "ignite").mockReturnValue(null);
    const platform = platformInCone();
    const actor = makeActor();
    const { pyro } = makePyro(actor, { elements: [platform] });
    pyro.start();
    pyro.pullTrigger();
    pyro.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(ignite).toHaveBeenCalledWith(
      expect.anything(),
      platform.ref,
      "left"
    );
  });

  it("stops igniting once the trigger has cooled", () => {
    const ignite = vi.spyOn(BurningElement, "ignite").mockReturnValue(null);
    const platform = platformInCone();
    const actor = makeActor();
    const { pyro } = makePyro(actor, { elements: [platform] });
    pyro.start();
    pyro.pullTrigger();
    vi.advanceTimersByTime(PYRO_TRIGGER_HOLD_MS + 50);
    pyro.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(ignite).not.toHaveBeenCalled();
  });

  it("sets another hog in the cone on fire, never itself", () => {
    const other = {
      setOnFire: vi.fn(),
      sprite: { x: 460, y: 310, width: 40, height: 40 },
    };
    const actor = makeActor();
    const { pyro } = makePyro(actor, {
      elements: [],
      getAllHedgehogs: () => [actor, other],
    });
    pyro.start();
    pyro.pullTrigger();
    pyro.update({ deltaMS: 16, deltaTime: 1 / 60 });
    expect(other.setOnFire).toHaveBeenCalledWith(1);
    expect(actor.setOnFire).not.toHaveBeenCalled();
  });

  it("removes the stream and fades the grade on end", () => {
    const actor = makeActor();
    const { game, pyro } = makePyro(actor);
    pyro.start();
    expect(
      game.elements.some((element) => element instanceof FlameStream)
    ).toBe(true);
    vi.advanceTimersByTime(PYRO_DURATION_MS + 1);
    expect(
      game.elements.some((element) => element instanceof FlameStream)
    ).toBe(false);
  });

  it("does not run end twice after destroy", () => {
    const actor = makeActor();
    const { game, pyro } = makePyro(actor);
    const removeElement = vi.spyOn(game, "removeElement");
    pyro.start();
    pyro.destroy();
    vi.advanceTimersByTime(PYRO_DURATION_MS + 1);
    expect(pyro.isActive).toBe(false);
    expect(removeElement).toHaveBeenCalledTimes(1);
  });
});
