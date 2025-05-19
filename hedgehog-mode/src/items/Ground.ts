import { Game, GameElement } from "../types";
import Matter from "matter-js";
import { COLLISIONS } from "../misc/collisions";

const GROUND_HEIGHT = 100;

const getGroundPosition = (worldWidth: number): Matter.Vector => {
  return {
    x: worldWidth * 0.5,
    y: window.innerHeight + GROUND_HEIGHT * 0.5,
  };
};

export class Ground implements GameElement {
  rigidBody: Matter.Body;
  isInteractive = false;
  isFlammable = true;

  constructor(
    private game: Game,
    private worldWidth: number = window.innerWidth * 3
  ) {
    // Ground should be set to the bottom of the screen
    this.rigidBody = Matter.Bodies.rectangle(
      getGroundPosition(this.worldWidth).x,
      getGroundPosition(this.worldWidth).y,
      this.worldWidth,
      GROUND_HEIGHT,
      {
        isStatic: true,
        label: "Ground",
        collisionFilter: {
          category: COLLISIONS.GROUND,
          mask: COLLISIONS.PLATFORM | COLLISIONS.ACTOR | COLLISIONS.PROJECTILE,
        },
      }
    );

    Matter.Composite.add(game.engine.world, this.rigidBody);

    // update just once to set the sprite initial position
    this.update();
  }

  update(): void {
    Matter.Body.setPosition(this.rigidBody, getGroundPosition(this.worldWidth));
  }
}
