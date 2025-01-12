import { Game, GameElement } from "../types";
import Matter from "matter-js";

const WALL_WIDTH = 10;
export class Wall implements GameElement {
  rigidBody: Matter.Body;
  isPointerOver = false;
  isInteractive = false;

  constructor(
    game: Game,
    private side: "left" | "right"
  ) {
    // Ground should be set to the bottom of the screen

    this.rigidBody = Matter.Bodies.rectangle(
      0,
      0,
      WALL_WIDTH,
      window.innerHeight,
      {
        isStatic: true,
        label: "Wall",
      }
    );

    Matter.Composite.add(game.engine.world, this.rigidBody);

    this.update();
  }

  update(): void {
    Matter.Body.setPosition(this.rigidBody, {
      x:
        this.side === "left"
          ? -WALL_WIDTH / 2
          : window.innerWidth + WALL_WIDTH / 2,
      y: window.innerHeight / 2,
    });

    // TODO: Fix the width scaling
  }
}
