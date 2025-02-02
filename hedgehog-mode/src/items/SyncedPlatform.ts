import { COLLISIONS } from "../misc/collisions";
import { Game, GameElement } from "../types";
import Matter from "matter-js";

const PLATFORM_HEIGHT = 5;

export class SyncedPlatform implements GameElement {
  rigidBody: Matter.Body;
  isPointerOver = false;
  isInteractive = false;
  lastRect: DOMRect | null = null;

  constructor(
    private game: Game,
    public ref: HTMLElement
  ) {
    // update just once to set the sprite initial position

    const rect = this.ref.getBoundingClientRect();

    this.rigidBody = Matter.Bodies.rectangle(
      rect.x + rect.width / 2,
      rect.y + PLATFORM_HEIGHT / 2,
      rect.width,
      PLATFORM_HEIGHT,
      {
        isStatic: true,
        isSensor: true,
        label: "SyncedPlatform",
        collisionFilter: {
          category: COLLISIONS.PLATFORM,
          mask: COLLISIONS.PLATFORM | COLLISIONS.ACTOR | COLLISIONS.PROJECTILE,
        },
      }
    );

    Matter.Composite.add(this.game.engine.world, this.rigidBody);
  }

  update(): void {
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

    const isOffScreen =
      rect.y > this.game.app.screen.height ||
      rect.x > this.game.app.screen.width ||
      rect.y + rect.height < 0 ||
      rect.x + rect.width < 0;

    Matter.Body.setPosition(this.rigidBody, {
      x: rect.x + rect.width / 2,
      y: rect.y + PLATFORM_HEIGHT / 2,
    });

    // TODO: Fix resizing of body

    this.rigidBody.isSensor = isOffScreen;
  }
}
