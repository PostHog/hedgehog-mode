import assert from "node:assert/strict";
import test from "node:test";
import { getDesktopBounds } from "./window-bounds.mjs";

test("uses the display work area so the hedgehog stays above the taskbar", () => {
  assert.deepEqual(
    getDesktopBounds({
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1040 },
    }),
    { x: 0, y: 0, width: 1920, height: 1040 }
  );
});

test("keeps the coordinates of a display to the left of the primary display", () => {
  assert.deepEqual(
    getDesktopBounds({
      workArea: { x: -1280, y: 40, width: 1280, height: 984 },
    }),
    { x: -1280, y: 40, width: 1280, height: 984 }
  );
});
