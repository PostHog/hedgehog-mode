import { describe, expect, it } from "vitest";

import { shoveOffset } from "../src/misc/transform";

const anchor = { x: 100, y: 200, scrollX: 0, scrollY: 0 };

describe("shoveOffset", () => {
  it("is the gap between the body and where the element started", () => {
    expect(shoveOffset(anchor, { x: 130, y: 260 }, { x: 0, y: 0 })).toEqual({
      dx: 30,
      dy: 60,
    });
  });

  it("is zero while the body sits on the anchor", () => {
    expect(shoveOffset(anchor, { x: 100, y: 200 }, { x: 0, y: 0 })).toEqual({
      dx: 0,
      dy: 0,
    });
  });

  it("compensates for the page scrolling underneath it", () => {
    // Scrolling down 50px carries the element's layout position up 50px, so
    // holding the body still has to translate 50px further down to match.
    expect(shoveOffset(anchor, { x: 100, y: 200 }, { x: 0, y: 50 })).toEqual({
      dx: 0,
      dy: 50,
    });
  });

  it("handles an element shoved on an already-scrolled page", () => {
    const scrolled = { x: 0, y: 400, scrollX: 0, scrollY: 400 };

    expect(shoveOffset(scrolled, { x: 0, y: 400 }, { x: 0, y: 400 })).toEqual({
      dx: 0,
      dy: 0,
    });
  });
});
