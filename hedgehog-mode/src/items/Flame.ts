import { Actor } from "../actors/Actor";
import { Game, GameElement, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";
import gsap from "gsap";
import { range } from "lodash";

const FLAME_SCALE = 0.2;

let TOTAL_NUM_FLAMES = 0;

export class FlameActor extends Actor {
  public isFlammable = false;

  static fireBurst(game: Game, position: Matter.Vector): void {
    if (TOTAL_NUM_FLAMES > 200) {
      return;
    }
    range(10).forEach(() => {
      const flame = new FlameActor(game);
      flame.setPosition({
        x: position.x + (Math.random() - 0.5) * 10,
        y: position.y + (Math.random() - 0.5) * 10,
      });
      flame.setVelocity({
        x: (Math.random() - 0.5) * 10,
        y: -10,
      });
      game.world.elements.push(flame);
    });
  }

  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  fadeValue = 0;

  collisionFilter = {
    category: COLLISIONS.PROJECTILE,
    mask: COLLISIONS.PLATFORM | COLLISIONS.GROUND,
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
    });

    this.loadSprite("overlays/fire/tile");
    this.isInteractive = false;

    this.sprite!.anchor.set(0.5, 0);
    this.setScale(0.4);

    setTimeout(() => {
      gsap.to(this, {
        fadeValue: 1,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
          this.game.world.removeElement(this);
        },
      });
    }, 1000);

    TOTAL_NUM_FLAMES++;
  }

  update(ticker: UpdateTicker): void {
    this.sprite!.alpha = (1 - this.fadeValue) * 0.75;
    const scale = (1 - this.fadeValue) * FLAME_SCALE;
    this.sprite!.scale.set(scale, scale);

    super.update(ticker);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    pair.isActive = false;
    // if (element instanceof HedgehogActor) {
    //   console.log("COLLISION", element);
    //   element.setOnFire();
    // }
  }

  beforeUnload(): void {
    TOTAL_NUM_FLAMES--;
  }
}
