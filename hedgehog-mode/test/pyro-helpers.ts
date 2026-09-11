import gsap from "gsap";

const noop = () => undefined;

/**
 * Minimal fake Pixi objects for element-level tests. Each records what matters
 * (children, positions) so assertions can reach into the graph.
 */
export function fakeContainer() {
  const children: unknown[] = [];
  const container = {
    children,
    x: 0,
    y: 0,
    alpha: 1,
    visible: true,
    renderable: true,
    scale: { x: 1, y: 1, set: noop },
    position: {
      x: 0,
      y: 0,
      set(x: number, y: number) {
        this.x = x;
        this.y = y;
      },
    },
    anchor: { set: noop },
    rotation: 0,
    tint: 0xffffff,
    blendMode: "normal",
    addChild(child: unknown) {
      children.push(child);
      return child;
    },
    removeChild(child: unknown) {
      const index = children.indexOf(child);
      if (index >= 0) {
        children.splice(index, 1);
      }
      return child;
    },
    setChildIndex(child: unknown, index: number) {
      const current = children.indexOf(child);
      if (current >= 0) {
        children.splice(current, 1);
        children.splice(index, 0, child);
      }
    },
    destroy: noop,
  };
  return container;
}

export function fakeSprite() {
  return {
    ...fakeContainer(),
    width: 10,
    height: 10,
    texture: undefined,
  };
}

export function fakeScreen() {
  return { width: 1920, height: 1080 };
}

export function fakeStage() {
  return {
    ...fakeContainer(),
    addChildAt(child: unknown, index: number) {
      (this as { children: unknown[] }).children.splice(index, 0, child);
      return child;
    },
    filters: null as unknown[] | null,
    hitArea: null as unknown,
  };
}

export function fakeApp() {
  return {
    stage: fakeStage(),
    screen: fakeScreen(),
    renderer: { generateTexture: () => ({}) },
  };
}

export function fakeGame(overrides: Record<string, unknown> = {}) {
  const app = fakeApp();
  const game: Record<string, unknown> & {
    elements: {
      update?: (ticker: unknown) => void;
      beforeUnload?: () => void;
    }[];
    removeElement: (element: unknown) => void;
  } = {
    elements: [],
    app,
    engine: { world: {} },
    log: noop,
    worldFx: {
      fx: fakeContainer(),
      under: fakeContainer(),
      emberField: { emitEmbers: vi.fn(), emitSmoke: vi.fn() },
      scorchLayer: { mark: vi.fn() },
      shake: vi.fn(),
      fadeGrade: vi.fn(),
      setGrade: vi.fn(),
    },
    getAllHedgehogs: () => [],
    spritesManager: { getAnimatedSpriteFrames: () => [] },
    removeElement(element) {
      const el = element as { beforeUnload?: () => void };
      el.beforeUnload?.();
      const index = this.elements.indexOf(element as never);
      if (index >= 0) {
        this.elements.splice(index, 1);
      }
    },
    ...overrides,
  };
  return game;
}

/**
 * Drive a game element (and any gsap tweens it starts) forward through time.
 */
export function tick(
  element: { update: (ticker: { deltaMS: number; deltaTime: number }) => void },
  seconds: number,
  step = 1 / 60,
  gsapStart = 0
): void {
  let gsapTime = gsapStart;
  const frames = Math.ceil(seconds / step);
  for (let i = 0; i < frames; i++) {
    gsapTime += step;
    gsap.updateRoot(gsapTime);
    element.update({ deltaMS: step * 1000, deltaTime: step });
  }
}

export function fakePlatform(rect: DOMRect): {
  ref: HTMLElement;
  lastRect: DOMRect;
} {
  const ref = document.createElement("div");
  ref.getBoundingClientRect = () => rect;
  return { ref, lastRect: rect };
}

export function fakeRect(
  x: number,
  y: number,
  width: number,
  height: number
): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  } as DOMRect;
}
