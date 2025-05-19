import { Actor } from "../actors/Actor";
import { Game } from "../types";
import { COLLISIONS } from "../misc/collisions";
import Matter from "matter-js";
import { AvailableSpriteFrames } from "../sprites/sprites";
import { HedgehogActorAccessoryOption } from "../hedgehog-mode";
import gsap from "gsap";

export class Accessory extends Actor {
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
    mask: COLLISIONS.PLATFORM | COLLISIONS.GROUND,
  };

  accessory: HedgehogActorAccessoryOption;
  alpha = 1;

  constructor(
    game: Game,
    options: {
      accessory: HedgehogActorAccessoryOption;
      position: Matter.Vector;
    }
  ) {
    super(game, {
      density: 0.001,
      friction: 0.2,
      frictionStatic: 0,
      frictionAir: 0.01,
      restitution: 0.5,
      inertia: Infinity,
      inverseInertia: Infinity,
      label: "Inventory",
    });

    this.accessory = options.accessory;

    const frame = this.game.spritesManager.getSpriteFrames(
      `accessories/${this.accessory}.png` as AvailableSpriteFrames
    );

    if (!frame) {
      this.game.log("Frame not found!", `accessories/${this.accessory}.png`);
      return;
    }

    this.loadSpriteFrames([frame]);
    this.setScale(0.8);

    this.setPosition({
      x: options.position.x,
      y: options.position.y,
    });

    this.setVelocity({
      x: (0.5 - Math.random()) * 2,
      y: -1,
    });

    gsap.to(this, {
      alpha: 0,
      duration: 5,
      ease: "none",
      onComplete: () => {
        this.game.world.removeElement(this);
      },
    });
  }
}
