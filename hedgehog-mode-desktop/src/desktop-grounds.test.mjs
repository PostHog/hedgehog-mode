import assert from "node:assert/strict";
import test from "node:test";
import Matter from "matter-js";
import { addDesktopGroundSegments } from "./desktop-grounds.mjs";

test("adds a solid ground body at the bottom of every display", () => {
  const engine = Matter.Engine.create();
  const game = {
    engine,
    elements: [
      {
        rigidBody: Matter.Bodies.rectangle(0, 0, 10, 10, {
          label: "Ground",
        }),
      },
    ],
  };

  const grounds = addDesktopGroundSegments(game, [
    { x: 0, y: 799, width: 1280 },
    { x: 1280, y: 999, width: 1920 },
  ]);

  assert.deepEqual(
    grounds.map((ground) => ({
      left: ground.rigidBody.bounds.min.x,
      top: ground.rigidBody.bounds.min.y,
      right: ground.rigidBody.bounds.max.x,
    })),
    [
      { left: 0, top: 799, right: 1280 },
      { left: 1280, top: 999, right: 3200 },
    ]
  );
});
