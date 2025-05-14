import { Game, GameElement } from "../types";
import Matter from "matter-js";
import { COLLISIONS } from "../misc/collisions";

export class Platform implements GameElement {
  rigidBody: Matter.Body;
  isInteractive = false;
  isFlammable = true;

  constructor(
    private game: Game,
    private rect: { x: number; y: number; width: number; height: number }
  ) {
    // Ground should be set to the bottom of the screen
    this.rigidBody = Matter.Bodies.rectangle(
      this.rect.x,
      this.rect.y,
      this.rect.width,
      this.rect.height,
      {
        isStatic: true,
        label: "Platform",
        collisionFilter: {
          category: COLLISIONS.PLATFORM,
          mask: COLLISIONS.ACTOR | COLLISIONS.PROJECTILE,
        },
      }
    );

    Matter.Composite.add(game.engine.world, this.rigidBody);

    // update just once to set the sprite initial position
    this.update();
  }

  update(): void {
    Matter.Body.setPosition(this.rigidBody, this.rect);
  }
}
