import assert from "node:assert/strict";
import test from "node:test";
import {
  findSpriteAtPoint,
  getSpriteHitArea,
  isPointInArea,
} from "./desktop-interaction.mjs";

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

test("uses the visible sprite for the desktop draggable area", () => {
  assert.deepEqual(
    getSpriteHitArea({ minX: 20, minY: 30, maxX: 100, maxY: 110 }),
    { min: { x: 12, y: 22 }, max: { x: 108, y: 118 } }
  );
});

test("finds a visible sprite outside its smaller physics body", () => {
  const actor = {
    sprite: {
      getBounds: () => ({ minX: 20, minY: 30, maxX: 100, maxY: 110 }),
    },
  };

  assert.equal(findSpriteAtPoint([actor], { x: 15, y: 70 }), actor);
});
