import { Game, GameElement } from "../types";
import Matter from "matter-js";

export class SyncedBox implements GameElement {
  rigidBody: Matter.Body;
  isPointerOver = false;
  isInteractive = false;

  lastRect: DOMRect | null = null;

  constructor(
    private game: Game,
    public ref: HTMLElement
  ) {
    // update just once to set the sprite initial position
    this.update();
  }

  update(): void {
    // TODO: Remove if out of screen bounds or if removed from DOM
    // Check the element is still in the DOM
    // Get its bounds - if they have changed then update the rigid body position

    const rect = this.ref.getBoundingClientRect();

    if (
      this.lastRect &&
      this.lastRect.x === rect.x &&
      this.lastRect.y === rect.y &&
      this.lastRect.width === rect.width &&
      this.lastRect.height === rect.height
    ) {
      return;
    }

    this.lastRect = rect;

    const oldBody = this.rigidBody;

    this.rigidBody = Matter.Bodies.rectangle(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      rect.width,
      rect.height,
      {
        isStatic: true,
        label: "SyncedBox",
      }
    );

    Matter.Composite.add(this.game.engine.world, this.rigidBody);

    if (oldBody) {
      // destroy it
      Matter.Composite.remove(this.game.engine.world, oldBody);
    }
  }
}
