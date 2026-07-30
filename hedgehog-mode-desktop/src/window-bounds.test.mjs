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
    getDesktopBounds(
      {
        bounds: { x: 0, y: 0, width: 1920, height: 1080 },
        workArea: { x: 0, y: 0, width: 1920, height: 1040 },
      },
      "win32"
    ),
    { x: 0, y: 0, width: 1920, height: 1040 }
  );
});

test("uses the full macOS display so an auto-hidden Dock leaves no gap", () => {
  const display = {
    bounds: { x: 0, y: 0, width: 1728, height: 1117 },
    workArea: { x: 0, y: 25, width: 1728, height: 987 },
  };

  assert.deepEqual(getDesktopBounds(display, "darwin"), display.bounds);
  assert.deepEqual(getDisplayFloors([display], display.bounds, "darwin"), [
    { x: 0, y: 1116, width: 1728 },
  ]);
});

test("keeps adjacent macOS displays connected below their Dock work areas", () => {
  const layout = getVirtualDesktop(
    [
      {
        bounds: { x: 0, y: 0, width: 1728, height: 1117 },
        workArea: { x: 0, y: 25, width: 1728, height: 987 },
      },
      {
        bounds: { x: 1728, y: 0, width: 1920, height: 1080 },
        workArea: { x: 1728, y: 25, width: 1920, height: 955 },
      },
    ],
    "darwin"
  );

  assert.deepEqual(layout, {
    bounds: { x: 0, y: 0, width: 3648, height: 1117 },
    floors: [
      { x: 0, y: 1116, width: 1728 },
      { x: 1728, y: 1079, width: 1920 },
    ],
  });
});

test("keeps the coordinates of a display to the left of the primary display", () => {
  assert.deepEqual(
    getDesktopBounds(
      {
        workArea: { x: -1280, y: 40, width: 1280, height: 984 },
      },
      "win32"
    ),
    { x: -1280, y: 40, width: 1280, height: 984 }
  );
});

test("combines all displays into one desktop with a floor per screen", () => {
  assert.deepEqual(
    getVirtualDesktop(
      [
        { workArea: { x: -1280, y: 56, width: 1280, height: 968 } },
        { workArea: { x: 0, y: 0, width: 1920, height: 1040 } },
        { workArea: { x: 1920, y: 120, width: 1440, height: 900 } },
      ],
      "win32"
    ),
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
  const layout = getVirtualDesktop(
    [
      { workArea: { x: 0, y: 0, width: 1920, height: 1040 } },
      { workArea: { x: 1920, y: 80, width: 1280, height: 900 } },
    ],
    "win32"
  );

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
      { x: 0, y: 24, width: 1920, height: 1016 },
      "win32"
    ),
    [{ x: 0, y: 1015, width: 1920 }]
  );
});

test("spawns the player on the largest visible display floor", () => {
  assert.deepEqual(
    getVisibleSpawnPosition(
      [
        { x: -1280, y: 899, width: 1280 },
        { x: 0, y: 999, width: 1920 },
        { x: 1920, y: 899, width: 1280 },
      ],
      1920,
      1000,
      40
    ),
    { x: 960, y: 959 }
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
