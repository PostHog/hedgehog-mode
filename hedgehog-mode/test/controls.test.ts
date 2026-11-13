import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HedgehogActor } from "../src/actors/Hedgehog";
import { HedgehogActorControls } from "../src/actors/hedgehog/controls";

type KeyboardListener = (event: KeyboardEvent) => void;

describe("HedgehogActorControls", () => {
  const listeners = new Map<string, KeyboardListener>();

  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("removes fire controls and their timer on destroy", () => {
    const maybeSpawnFireball = vi.fn<() => void>();
    const actor = {
      options: { controls_enabled: true },
      maybeSpawnFireball,
    } as unknown as HedgehogActor;
    const controls = new HedgehogActorControls(actor);

    listeners.get("keydown")?.({ key: "f" } as KeyboardEvent);
    vi.advanceTimersByTime(100);
    expect(maybeSpawnFireball).toHaveBeenCalledTimes(2);

    controls.destroy();
    vi.advanceTimersByTime(500);
    listeners.get("keydown")?.({ key: "f" } as KeyboardEvent);

    expect(maybeSpawnFireball).toHaveBeenCalledTimes(2);
    expect(listeners.size).toBe(0);
  });
});
