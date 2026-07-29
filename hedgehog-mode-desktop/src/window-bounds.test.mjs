import assert from "node:assert/strict";
import test from "node:test";
import {
  getDesktopBounds,
  getDisplayFloors,
  getVisibleFloorSegments,
  getVisibleSpawnPosition,
  getVirtualDesktop,
} from "./window-bounds.mjs";

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
        { x: 0, y: 1023, width: 1280 },
        { x: 1280, y: 1039, width: 1920 },
        { x: 3200, y: 1019, width: 1440 },
      ],
    }
  );
});

test("keeps every one-pixel floor inside the virtual desktop", () => {
  const layout = getVirtualDesktop([
    { workArea: { x: 0, y: 0, width: 1920, height: 1040 } },
    { workArea: { x: 1920, y: 80, width: 1280, height: 900 } },
  ]);

  assert.equal(
    layout.floors.every(
      (floor) => floor.y >= 0 && floor.y + 1 <= layout.bounds.height
    ),
    true
  );
});

test("positions floors relative to the actual Electron content bounds", () => {
  assert.deepEqual(
    getDisplayFloors(
      [{ workArea: { x: 0, y: 24, width: 1920, height: 1016 } }],
      { x: 0, y: 24, width: 1920, height: 1016 }
    ),
    [{ x: 0, y: 1015, width: 1920 }]
  );
});

test("spawns the player on the largest display segment visible to the renderer", () => {
  assert.deepEqual(
    getVisibleSpawnPosition(
      [
        { x: -1280, y: 899, width: 1280 },
        { x: 0, y: 999, width: 1920 },
        { x: 1920, y: 899, width: 1280 },
      ],
      1920,
      1000
    ),
    { x: 960, y: 100 }
  );
});

test("excludes monitor segments outside the actual renderer viewport", () => {
  assert.deepEqual(
    getVisibleFloorSegments(
      [
        { x: -1280, y: 799, width: 1280 },
        { x: 0, y: 799, width: 1280 },
      ],
      1280,
      800
    ),
    [{ left: 0, right: 1280, y: 799 }]
  );
});
