import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeNativeWindows,
  parseWindowRects,
} from "./window-platforms.mjs";

test("translates OS window bounds into virtual desktop platforms", () => {
  assert.deepEqual(
    parseWindowRects("-1200\t100\t800\t600\n100\t40\t1000\t700\n", {
      x: -1280,
      y: 0,
      width: 3200,
      height: 1040,
    }),
    [
      { x: 80, y: 100, width: 800 },
      { x: 1380, y: 40, width: 1000 },
    ]
  );
});

test("clips windows to the virtual desktop and ignores invalid rows", () => {
  assert.deepEqual(
    parseWindowRects(
      "-1400 20 300 500\n1800 -8 400 900\ninvalid\n0 0 5 100\n",
      { x: -1280, y: 0, width: 3200, height: 1040 }
    ),
    [
      { x: 0, y: 20, width: 180 },
      { x: 3080, y: 0, width: 120 },
    ]
  );
});

test("normalizes native macOS window metadata without titles", () => {
  assert.deepEqual(
    normalizeNativeWindows(
      [
        {
          bounds: { x: -1200, y: 100, width: 800, height: 600 },
          owner: { processId: 123 },
        },
        { bounds: { x: 10, y: 20, width: 5, height: 100 }, owner: {} },
      ],
      { x: -1280, y: 0, width: 3200, height: 1040 }
    ),
    [{ x: 80, y: 100, width: 800 }]
  );
});

test("ignores macOS system surfaces such as the Dock", () => {
  assert.deepEqual(
    normalizeNativeWindows(
      [
        {
          bounds: { x: 0, y: 900, width: 1728, height: 217 },
          owner: { bundleId: "com.apple.dock", processId: 123 },
        },
        {
          bounds: { x: 100, y: 200, width: 800, height: 600 },
          owner: { bundleId: "com.apple.Safari", processId: 456 },
        },
      ],
      { x: 0, y: 0, width: 1728, height: 1117 }
    ),
    [{ x: 100, y: 200, width: 800 }]
  );
});
