import { Actor } from "../actors/Actor";
import { Game } from "../types";
import { Ticker } from "pixi.js";
import { COLLISIONS } from "../misc/collisions";
import gsap from "gsap";

export class FlameActor extends Actor {
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
    const scale = (1 - this.fadeValue) * 0.4;
    this.sprite.scale.set(scale, scale);

    super.update(ticker);
  }
}
