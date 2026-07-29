import assert from "node:assert/strict";
import test from "node:test";
import { getDesktopBounds, getVirtualDesktop } from "./window-bounds.mjs";

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

test("combines all displays into one desktop with a floor per screen", () => {
  assert.deepEqual(
    getVirtualDesktop([
      { workArea: { x: -1280, y: 56, width: 1280, height: 968 } },
      { workArea: { x: 0, y: 0, width: 1920, height: 1040 } },
      { workArea: { x: 1920, y: 120, width: 1440, height: 900 } },
    ]),
    {
      bounds: { x: -1280, y: 0, width: 4640, height: 1040 },
      floors: [
        { x: 0, y: 1024, width: 1280 },
        { x: 1280, y: 1040, width: 1920 },
        { x: 3200, y: 1020, width: 1440 },
      ],
    }
  );
});
