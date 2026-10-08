import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HedgehogModeInterface } from "../src/types";
import { GlobalKeyboardListeners } from "../src/misc/GlobalKeyboardListeners";

type KeyboardListener = (event: KeyboardEvent) => void;

describe("GlobalKeyboardListeners", () => {
  const listeners = new Map<string, KeyboardListener>();

  beforeEach(() => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn<
        (event: string, listener: KeyboardListener) => void
      >((event: string, listener: KeyboardListener) =>
        listeners.set(event, listener)
      ),
      removeEventListener: vi.fn<(event: string) => void>((event: string) =>
        listeners.delete(event)
      ),
    });
  });

  afterEach(() => {
    listeners.clear();
    vi.unstubAllGlobals();
  });

  it("stops cheat sequences after destroy", () => {
    const spawnHedgehog = vi.fn<() => void>();
    const game = {
      spawnHedgehog,
      getPlayableHedgehog: () => undefined,
      getAllHedgehogs: () => [],
      setSpeed: () => {},
      engine: { timing: { timeScale: 1 } },
    } as unknown as HedgehogModeInterface;
    const controls = new GlobalKeyboardListeners(game);

    for (const key of ["s", "p", "a", "w", "n"]) {
      listeners.get("keydown")?.({ key } as KeyboardEvent);
    }
    expect(spawnHedgehog).toHaveBeenCalledTimes(1);

    controls.destroy();
    for (const key of ["s", "p", "a", "w", "n"]) {
      listeners.get("keydown")?.({ key } as KeyboardEvent);
    }

    expect(spawnHedgehog).toHaveBeenCalledTimes(1);
    expect(window.removeEventListener).toHaveBeenCalledTimes(1);
  });
});
