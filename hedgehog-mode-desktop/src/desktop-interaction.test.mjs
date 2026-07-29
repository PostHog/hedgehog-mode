import assert from "node:assert/strict";
import test from "node:test";
import { isPointInArea } from "./desktop-interaction.mjs";

const areas = [{ min: { x: 20, y: 30 }, max: { x: 100, y: 110 } }];

test("finds a hedgehog under the cursor on an offset display", () => {
  assert.equal(
    isPointInArea({ x: -1230, y: 80 }, { x: -1280, y: 0 }, areas),
    true
  );
});

test("leaves the desktop click-through outside a hedgehog", () => {
  assert.equal(
    isPointInArea({ x: -1100, y: 80 }, { x: -1280, y: 0 }, areas),
    false
  );
});
