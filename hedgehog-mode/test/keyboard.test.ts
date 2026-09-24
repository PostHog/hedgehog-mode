import { describe, expect, it } from "vitest";

import { normalizeEventKey, resolveControlKey } from "../src/misc/keyboard";

const event = (code: string, key: string) =>
  ({ code, key }) as Pick<KeyboardEvent, "code" | "key">;

describe("resolveControlKey", () => {
  it("resolves physical keys to controls", () => {
    expect(resolveControlKey(event("KeyA", "a"))).toBe("left");
    expect(resolveControlKey(event("ArrowRight", "ArrowRight"))).toBe("right");
    expect(resolveControlKey(event("Space", " "))).toBe("up");
    expect(resolveControlKey(event("KeyS", "s"))).toBe("down");
    expect(resolveControlKey(event("ShiftRight", "Shift"))).toBe("shift");
    expect(resolveControlKey(event("AltLeft", "Alt"))).toBe("alt");
    expect(resolveControlKey(event("KeyF", "f"))).toBe("f");
  });

  it("resolves WASD while option is held (macOS rewrites the key)", () => {
    expect(resolveControlKey(event("KeyA", "å"))).toBe("left");
    expect(resolveControlKey(event("KeyD", "∂"))).toBe("right");
    expect(resolveControlKey(event("KeyW", "∑"))).toBe("up");
  });

  it("resolves WASD while shift is held", () => {
    expect(resolveControlKey(event("KeyA", "A"))).toBe("left");
    expect(resolveControlKey(event("KeyD", "D"))).toBe("right");
  });

  it("falls back to the key when no code is reported", () => {
    expect(resolveControlKey(event("", "a"))).toBe("left");
    expect(resolveControlKey(event("", "ArrowUp"))).toBe("up");
    expect(resolveControlKey(event("", "F"))).toBe("f");
  });

  it("ignores keys that aren't controls", () => {
    expect(resolveControlKey(event("KeyQ", "q"))).toBeNull();
    expect(resolveControlKey(event("Enter", "Enter"))).toBeNull();
  });
});

describe("normalizeEventKey", () => {
  it("lowercases the reported key", () => {
    expect(normalizeEventKey({ key: "A" })).toBe("a");
    expect(normalizeEventKey({ key: "ArrowUp" })).toBe("arrowup");
  });

  it("returns null for a synthetic event that reports no key", () => {
    expect(normalizeEventKey({} as Pick<KeyboardEvent, "key">)).toBeNull();
  });
});
