import { afterEach, describe, expect, it, vi } from "vitest";

import { altKeyLabel, isAppleDevice } from "../src/misc/platform";

describe("altKeyLabel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls alt 'option' on apple devices", () => {
    vi.stubGlobal("navigator", { userAgentData: { platform: "macOS" } });

    expect(isAppleDevice()).toBe(true);
    expect(altKeyLabel()).toBe("⌥ option");
  });

  it("calls it alt everywhere else", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });

    expect(isAppleDevice()).toBe(false);
    expect(altKeyLabel()).toBe("alt");
  });

  it("survives having no navigator at all", () => {
    vi.stubGlobal("navigator", undefined);

    expect(altKeyLabel()).toBe("alt");
  });
});
