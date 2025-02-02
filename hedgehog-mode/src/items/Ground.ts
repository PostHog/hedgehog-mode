import { Game, GameElement } from "../types";
import Matter from "matter-js";
import { COLLISIONS } from "../misc/collisions";

const GROUND_HEIGHT = 100;

const getGroundPosition = (): Matter.Vector => {
  return {
    x: window.innerWidth * 0.5,
    y: window.innerHeight + GROUND_HEIGHT * 0.5,
  };
};

export class Ground implements GameElement {
  rigidBody: Matter.Body;
  isInteractive = false;
  isFlammable = true;

  constructor(game: Game) {
    // Ground should be set to the bottom of the screen

    this.rigidBody = Matter.Bodies.rectangle(
      getGroundPosition().x,
      getGroundPosition().y,
      window.innerWidth * 3, // Larger than the screen to avoid clipping
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
    Matter.Body.setPosition(this.rigidBody, getGroundPosition());
  }
}
