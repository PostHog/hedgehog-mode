import { Actor } from "../actors/Actor";
import { Game, GameElement } from "../types";
import { Ticker } from "pixi.js";
import { COLLISIONS } from "../misc/collisions";
import gsap from "gsap";
import { range } from "lodash";

const FLAME_SCALE = 0.2;

export class FlameActor extends Actor {
  static fireBurst(game: Game, position: Matter.Vector): void {
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
      game.elements.push(flame);
    });
  }

  public isFlammable = false;
  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  fadeValue = 0;

  constructor(game: Game) {
    super(game, {
      friction: 0.7,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.1,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Flame",
      isSensor: true,
      collisionFilter: {
        category: COLLISIONS.PROJECTILE,
        mask: COLLISIONS.PLATFORM,
      },
    });

    this.loadSprite("overlays/fire/tile");
    this.isInteractive = false;

    this.sprite.anchor.set(0.5, 0);
    this.setScale(0.4);

    setTimeout(() => {
      gsap.to(this, {
        fadeValue: 1,
        duration: 1,
        ease: "power2.in",
        onComplete: () => {
          this.game.removeElement(this);
        },
      });
    }, 1000);
  }

  update(ticker: Ticker): void {
    this.sprite.alpha = (1 - this.fadeValue) * 0.75;
    const scale = (1 - this.fadeValue) * FLAME_SCALE;
    this.sprite.scale.set(scale, scale);

    super.update(ticker);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    pair.isActive = false;
    // if (element instanceof HedgehogActor) {
    //   console.log("COLLISION", element);
    //   element.setOnFire();
    // }
  }
}
