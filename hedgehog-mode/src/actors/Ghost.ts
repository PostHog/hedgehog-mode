import { Actor } from "./Actor";
import { HedgehogModeInterface, UpdateTicker } from "../types";
import { COLLISIONS } from "../misc/collisions";
import gsap from "gsap";

export class HedgehogGhostActor extends Actor {
  x = 0;
  y = 0;
  alpha = 0;

  hitBoxModifier = {
    left: 0.24,
    right: 0.24,
    top: 0.35,
    bottom: 0.075,
  };

  collisionFilter = {
    category: COLLISIONS.PLATFORM,
    mask: COLLISIONS.PLATFORM,
  };

  constructor(game: HedgehogModeInterface, position: Matter.Vector) {
    super(game, {
      // It wont interact with gravity
      friction: 0,
      frictionStatic: 0,
      frictionAir: 0,
      restitution: 0,
      inertia: Infinity,
      inverseInertia: Infinity,
      isStatic: true,
    });
    this.isInteractive = false;

    this.loadSprite("skins/ghost/idle/tile");
    this.sprite!.alpha = 0;

    this.x = position.x;
    this.y = position.y;

    gsap.to(this, {
      y: this.y - 200,
      alpha: 0.5,
      duration: 2,
      ease: "none",
      onComplete: () => {
        gsap.to(this, {
          y: this.y - 200,
          alpha: 0,
          duration: 5,
          ease: "none",
          onComplete: () => {
            this.game.removeElement(this);
          },
        });
      },
    });
  }

  setPosition(position: Matter.Vector): void {
    this.x = position.x;
    this.y = position.y;

    super.setPosition(position);
  }

  update(ticker: UpdateTicker): void {
    super.update(ticker);

    this.setScale(0.9);
    this.sprite!.alpha = this.alpha;

    this.setPosition({
      x: this.x,
      y: this.y,
    });
  }
}
