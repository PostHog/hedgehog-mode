import Matter from "matter-js";
import { Actor } from "../actors/Actor";
import { Game } from "../types";
import { Ticker } from "pixi.js";
import { COLLISIONS } from "../misc/collisions";

// TODO: How to make this collide to trigger fires but not part of the physics collisions
export class FlameActor extends Actor {
  public isFlammable = false;
  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  constructor(game: Game) {
    super(game, {
      friction: 0.7,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.1,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Flame",
      collisionFilter: {
        category: COLLISIONS.PROJECTILE,
        mask: COLLISIONS.PLATFORM,
      },
    });

    this.loadSprite("overlays/fire/tile");
    this.isInteractive = false;

    this.sprite.anchor.set(0.5);
    this.sprite.alpha = 0.5;

    const scale = 0.3;
    this.sprite.scale.x = scale;
    this.sprite.scale.y = scale;

    Matter.Body.scale(this.rigidBody, scale, scale, {
      x: this.rigidBody.position.x,
      y: this.rigidBody.position.y,
    });

    setTimeout(() => {
      this.game.removeElement(this);
    }, 2000);
  }

  update(ticker: Ticker): void {
    super.update(ticker);
    this.rigidBody.angle = 0;
  }
}
