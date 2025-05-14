import { Actor } from "../actors/Actor";
import { Game, GameElement } from "../types";
import { COLLISIONS } from "../misc/collisions";
import Matter from "matter-js";

export class Weapon extends Actor {
  public isInteractive = true;
  public isFlammable = false;

  hitBoxModifier = {
    left: 0.2,
    right: 0.2,
    top: 0.2,
    bottom: 0.2,
  };

  protected collisionFilter = {
    category: COLLISIONS.ACTOR,
    mask: COLLISIONS.ACTOR | COLLISIONS.PLATFORM | COLLISIONS.GROUND,
  };

  constructor(game: Game) {
    super(game, {
      density: 0.001,
      friction: 0.2,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Weapon",
    });

    this.loadSprite("weapons/bazooka/tile");
    this.setScale(0.8);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    // You can add custom collision behavior here
  }
} 