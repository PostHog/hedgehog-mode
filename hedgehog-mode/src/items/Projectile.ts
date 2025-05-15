import { Actor } from "../actors/Actor";
import { Game, GameElement, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";
import { HedgehogActor } from "../actors/Hedgehog";
import { Terrain } from "./Terrain";
import { FlameActor } from "./Flame";
import { FloatingPlatform } from "./FloatingPlatform";

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
    private source: Actor,
    private options: {
      target: { x: number; y: number };
    }
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

    this.forceAngle = null;

    this.loadSprite("projectiles/missile/tile");
    this.isInteractive = false;

    this.sprite!.anchor.set(0.5, 0);
    this.setScale(0.4);

    const sourcePosition = this.source.rigidBody!.position;

    // Calculate direction vector
    const dx = options.target.x - sourcePosition.x;
    const dy = options.target.y - sourcePosition.y;

    // Calculate magnitude of direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    // Normalize the direction vector and multiply by desired speed
    const speed = 30; // Fixed speed value
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
    }, 5000);
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
    // calculate exact impact position (use contact vertex if present,
    // otherwise centre of our body)
    const impact = pair?.contacts?.[0]?.vertex ?? this.rigidBody!.position;

    // carve a 40-pixel radius crater when we hit terrain
    if (element instanceof Terrain) {
      element.carveCircle(impact.x, impact.y, 40);
      FlameActor.fireBurst(this.game, impact);
    } else if (element instanceof FloatingPlatform) {
      /* one hit = gone */
      this.game.world.removeElement(element);
      FlameActor.fireBurst(this.game, impact);
    }

    this.destroy();

    if (element instanceof HedgehogActor && element !== this.source) {
      element.receiveDamage(50, this);
    }
  }

  destroy(): void {
    this.game.world.removeElement(this);
  }

  beforeUnload(): void {}
}
