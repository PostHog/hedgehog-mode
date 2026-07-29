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
  return elements;
}
