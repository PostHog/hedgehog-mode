import { Game, GameElement } from "../types";
import Matter from "matter-js";
import { COLLISIONS } from "../misc/collisions";

const GROUND_HEIGHT = 20;

export class Ground implements GameElement {
  rigidBody: Matter.Body;
  isPointerOver = false;
  isInteractive = false;
  isFlammable = true;

  constructor(game: Game) {
    // Ground should be set to the bottom of the screen

    this.rigidBody = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + GROUND_HEIGHT * 0.5,
      window.innerWidth,
      GROUND_HEIGHT,
      {
        isStatic: true,
        label: "Ground",
        collisionFilter: {
          category: COLLISIONS.PLATFORM,
          mask: COLLISIONS.PLATFORM | COLLISIONS.ACTOR | COLLISIONS.PROJECTILE,
        },
      }
    );

    Matter.Composite.add(game.engine.world, this.rigidBody);

    // update just once to set the sprite initial position
    this.update();
  }

  update(): void {
    Matter.Body.setPosition(this.rigidBody, {
      x: window.innerWidth / 2,
      y: window.innerHeight + GROUND_HEIGHT * 0.5,
    });

    // TODO: Fix the width scaling
  }
}
