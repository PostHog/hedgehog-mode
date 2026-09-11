// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  class FakeAnimatedSprite extends FakeContainer {
    alpha = 1;
    rotation = 0;
    blendMode = "normal";
    animationSpeed = 1;
    anchor = { set: () => undefined };
    scale = { set: () => undefined };
    position = { set: () => undefined, x: 0, y: 0 };
    gotoAndPlay() {}
    constructor(public frames?: unknown) {
      super();
    }
  }
  class FakeGraphics extends FakeContainer {
    poly() {
      return this;
    }
    stroke() {
      return this;
    }
    clear() {
      return this;
    }
  }
  return {
    AnimatedSprite: FakeAnimatedSprite,
    Graphics: FakeGraphics,
    Container: FakeContainer,
    Texture: class {},
  };
});

import {
  BURN_DURATION_S,
  BurningElement,
  MAX_BURNING,
} from "../src/items/BurningElement";
import { ShovedElement } from "../src/items/ShovedElement";
import { SyncedPlatform } from "../src/items/SyncedPlatform";
import { fakeGame, fakeRect, tick } from "./pyro-helpers";

function makeElement(rect = fakeRect(100, 100, 120, 60)): HTMLElement {
  const element = document.createElement("div");
  element.getBoundingClientRect = () => rect;
  document.body.appendChild(element);
  return element;
}

function makePlatform(rect: DOMRect): SyncedPlatform {
  return Object.assign(Object.create(SyncedPlatform.prototype), {
    ref: makeElement(rect),
    lastRect: rect,
  });
}

describe("BurningElement", () => {
  let game: ReturnType<typeof fakeGame>;

  beforeEach(() => {
    game = fakeGame();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    [...game.elements].forEach((element) => game.removeElement(element));
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("refuses to burn past the cap", () => {
    for (let i = 0; i < MAX_BURNING; i++) {
      expect(
        BurningElement.ignite(
          game as never,
          makeElement(fakeRect(i * 200, 0, 100, 40)),
          "left"
        )
      ).not.toBeNull();
    }
    expect(
      BurningElement.ignite(game as never, makeElement(), "left")
    ).toBeNull();
  });

  it("refuses elements bigger than the viewport share", () => {
    const huge = makeElement(fakeRect(0, 0, 1920, 1080));
    expect(BurningElement.ignite(game as never, huge, "left")).toBeNull();
  });

  it("refuses an element that holds the focused input", () => {
    const wrapper = makeElement();
    const input = document.createElement("input");
    wrapper.appendChild(input);
    input.focus();
    expect(BurningElement.ignite(game as never, wrapper, "left")).toBeNull();
  });

  it("refuses an element the host opted out", () => {
    const wrapper = makeElement();
    wrapper.setAttribute("data-hedgehog-no-burn", "");
    expect(BurningElement.ignite(game as never, wrapper, "left")).toBeNull();
  });

  it("refuses an element that is already airborne", () => {
    vi.spyOn(ShovedElement, "isShoved").mockReturnValue(true);
    expect(
      BurningElement.ignite(game as never, makeElement(), "left")
    ).toBeNull();
  });

  it("returns the existing instance when ignited twice", () => {
    const element = makeElement();
    const first = BurningElement.ignite(game as never, element, "left");
    const second = BurningElement.ignite(game as never, element, "right");
    expect(second).toBe(first);
  });

  it("writes a char filter and a clip-path while burning", () => {
    const element = makeElement();
    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, 1);
    expect(element.style.filter).toContain("sepia(");
    expect(element.style.clipPath.startsWith("polygon(")).toBe(true);
  });

  it("keeps the clip-path stable between frames with no elapsed time", () => {
    const element = makeElement();
    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, 0.5);
    const first = element.style.clipPath;
    burning.update({ deltaMS: 0, deltaTime: 0 });
    expect(element.style.clipPath).toBe(first);
  });

  it("hands the element to ShovedElement at the collapse point", () => {
    const shove = vi.spyOn(ShovedElement, "shove").mockReturnValue(null);
    const element = makeElement();
    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, BURN_DURATION_S * 0.71);
    expect(shove).toHaveBeenCalledTimes(1);
    expect(shove.mock.calls[0][1]).toBe(element);
  });

  it("emits embers, smoke and scorch marks during the burn", () => {
    const element = makeElement();
    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, 1.5);
    const fx = game.worldFx as {
      emberField: { emitEmbers: ReturnType<typeof vi.fn> };
      scorchLayer: { mark: ReturnType<typeof vi.fn> };
    };
    expect(fx.emberField.emitEmbers).toHaveBeenCalled();
    expect(fx.scorchLayer.mark).toHaveBeenCalled();
  });

  it("spreads to a touching platform when the dice land", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const first = makeElement(fakeRect(100, 100, 120, 60));
    const neighbour = makePlatform(fakeRect(225, 100, 120, 60));
    game.elements.push(neighbour);

    const burning = BurningElement.ignite(game as never, first, "left")!;
    tick(burning, 0.6);

    expect(BurningElement.isBurning(neighbour.ref)).toBe(true);
  });

  it("does not spread when the dice miss", () => {
    vi.spyOn(Math, "random").mockReturnValue(1);
    const first = makeElement(fakeRect(100, 100, 120, 60));
    const neighbour = makePlatform(fakeRect(225, 100, 120, 60));
    game.elements.push(neighbour);

    const burning = BurningElement.ignite(game as never, first, "left")!;
    tick(burning, 0.6);

    expect(BurningElement.isBurning(neighbour.ref)).toBe(false);
  });

  it("removes itself and restores styles when the element leaves the DOM", () => {
    const element = makeElement();
    element.style.filter = "blur(1px)";
    const burning = BurningElement.ignite(game as never, element, "left")!;
    element.remove();
    burning.update({ deltaMS: 16, deltaTime: 1 / 60 });

    expect(game.elements).not.toContain(burning);
    expect(element.style.filter).toBe("blur(1px)");
    expect(element.style.clipPath).toBe("");
  });

  it("restores the original inline styles on unload", () => {
    const element = makeElement();
    element.style.filter = "blur(1px)";
    element.style.clipPath = "inset(1px)";
    element.style.transition = "all 1s";
    element.style.willChange = "transform";

    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, 1);
    burning.beforeUnload();

    expect(element.style.filter).toBe("blur(1px)");
    expect(element.style.clipPath).toBe("inset(1px)");
    expect(element.style.transition).toBe("all 1s");
    expect(element.style.willChange).toBe("transform");
  });

  it("heals the element and removes itself when the burn completes", () => {
    vi.spyOn(ShovedElement, "shove").mockReturnValue(null);
    const element = makeElement();
    const burning = BurningElement.ignite(game as never, element, "left")!;
    tick(burning, BURN_DURATION_S + 2);

    expect(game.elements).not.toContain(burning);
    expect(element.style.filter).toBe("");
    expect(element.style.clipPath).toBe("");
    expect(BurningElement.isBurning(element)).toBe(false);
  });
});
