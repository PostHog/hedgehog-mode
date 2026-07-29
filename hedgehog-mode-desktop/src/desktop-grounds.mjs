import Matter from "matter-js";

const GROUND_HEIGHT = 100;

export function addDesktopGroundSegments(game, floors) {
  const builtInGround = game.elements.find(
    (element) => element.rigidBody?.label === "Ground"
  );
  if (!builtInGround?.rigidBody) {
    throw new Error("Hedgehog Mode ground is not initialized");
  }

  const elements = floors.map((floor) => {
    const rigidBody = Matter.Bodies.rectangle(
      floor.x + floor.width / 2,
      floor.y + GROUND_HEIGHT / 2,
      floor.width,
      GROUND_HEIGHT,
      {
        isStatic: true,
        label: "DesktopGround",
        collisionFilter: { ...builtInGround.rigidBody.collisionFilter },
      }
    );
    Matter.Composite.add(game.engine.world, rigidBody);
    return {
      rigidBody,
      isInteractive: false,
      isFlammable: true,
      update() {},
    };
  });

  game.elements.push(...elements);
  const actorFloors = new WeakMap();
  game.elements.unshift({
    isInteractive: false,
    update() {
      for (const actor of game.getAllHedgehogs()) {
        const floor = floors.find(
          (candidate) =>
            actor.rigidBody.position.x >= candidate.x &&
            actor.rigidBody.position.x <= candidate.x + candidate.width
        );
        if (actor.isDragging) continue;
        const previousFloor = actorFloors.get(actor);
        actorFloors.set(actor, floor);
        if (
          !floor ||
          actor.rigidBody.bounds.max.y <= floor.y ||
          (actor.rigidBody.velocity.y < 0 && floor === previousFloor)
        ) {
          continue;
        }
        const vertexY = actor.rigidBody.vertices.map((vertex) => vertex.y);
        const halfHeight = (Math.max(...vertexY) - Math.min(...vertexY)) / 2;
        Matter.Body.setVelocity(actor.rigidBody, {
          x: actor.rigidBody.velocity.x,
          y: 0,
        });
        Matter.Body.setPosition(actor.rigidBody, {
          x: actor.rigidBody.position.x,
          y: floor.y - halfHeight,
        });
      }
    },
  });
  return elements;
}
