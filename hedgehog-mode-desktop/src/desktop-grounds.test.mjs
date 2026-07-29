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

test("stops a falling hedgehog at its display floor", () => {
  const engine = Matter.Engine.create();
  const actor = {
    isDragging: false,
    rigidBody: Matter.Bodies.rectangle(200, 850, 80, 80),
  };
  Matter.Body.setVelocity(actor.rigidBody, { x: 2, y: 10 });
  const game = {
    engine,
    getAllHedgehogs: () => [actor],
    elements: [
      {
        rigidBody: Matter.Bodies.rectangle(0, 0, 10, 10, {
          label: "Ground",
        }),
      },
    ],
  };

  addDesktopGroundSegments(game, [{ x: 0, y: 799, width: 1280 }]);
  game.elements[0].update();

  assert.deepEqual(
    {
      bottom: actor.rigidBody.bounds.max.y,
      velocityY: actor.rigidBody.velocity.y,
    },
    { bottom: 799, velocityY: 0 }
  );
});

test("moves a hedgehog onto a higher neighboring display floor", () => {
  const engine = Matter.Engine.create();
  const actor = {
    isDragging: false,
    rigidBody: Matter.Bodies.rectangle(1200, 950, 80, 80),
  };
  const game = {
    engine,
    getAllHedgehogs: () => [actor],
    elements: [
      {
        rigidBody: Matter.Bodies.rectangle(0, 0, 10, 10, {
          label: "Ground",
        }),
      },
    ],
  };

  addDesktopGroundSegments(game, [
    { x: 0, y: 999, width: 1280 },
    { x: 1280, y: 799, width: 1280 },
  ]);
  game.elements[0].update();
  Matter.Body.setPosition(actor.rigidBody, { x: 1300, y: 900 });
  Matter.Body.setVelocity(actor.rigidBody, { x: 2, y: -5 });
  game.elements[0].update();

  assert.equal(actor.rigidBody.bounds.max.y, 799);
});
