import { Actor } from "../actors/Actor";
import { Game, GameElement, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";
import { HedgehogActor } from "../actors/Hedgehog";

let PROJECTILE_ID = 0;

export class Projectile extends Actor {
  angle = 0;

  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  fadeValue = 0;

  collisionFilter = {
    category: COLLISIONS.PROJECTILE,
    mask: COLLISIONS.PLATFORM | COLLISIONS.GROUND | COLLISIONS.ACTOR,
  };

  constructor(
    game: Game,
    private source: Actor
  ) {
    super(game, {
      id: PROJECTILE_ID++,
      friction: 0.7,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.1,
      //   inertia: Infinity,
      //   inverseInertia: Infinity,
      //   inverseMass: 0,
      label: "Projectile",
    });

    this.loadSprite("projectiles/missile/tile");
    this.isInteractive = false;

    this.sprite!.anchor.set(0.5, 0);
    this.setScale(0.4);
  }

  fire(options: { target: { x: number; y: number } }): void {
    const sourcePosition = this.source.rigidBody!.position;

    // Calculate direction vector
    const dx = options.target.x - sourcePosition.x;
    const dy = options.target.y - sourcePosition.y;

    // Calculate magnitude of direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector and multiply by desired speed
    const speed = 40; // Fixed speed value
    const normalizedDx = (dx / magnitude) * speed;
    const normalizedDy = (dy / magnitude) * speed;

    this.setPosition({
      x: sourcePosition.x,
      y: sourcePosition.y,
    });

    this.setVelocity({
      x: normalizedDx,
      y: normalizedDy,
    });

    setTimeout(() => {
      this.destroy();
    }, 2000);
  }

  update(ticker: UpdateTicker): void {
    // Calculate the angle based on veloctiy
    const angle = Math.atan2(
      this.rigidBody!.velocity.y,
      this.rigidBody!.velocity.x
    );

    this.forceAngle = angle;
    super.update(ticker);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    pair.isActive = false;

    if (element instanceof HedgehogActor && element !== this.source) {
      this.destroy();
      element.receiveDamage(10, this);
    }
  }

  destroy(): void {
    this.game.world.removeElement(this);
  }

  beforeUnload(): void {}
}
