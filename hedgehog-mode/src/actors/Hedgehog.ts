import { Actor } from "./Actor";
import { Game, GameElement } from "../types";
import Matter, { Constraint, Pair } from "matter-js";
import { SyncedBox } from "../items/SyncedBox";
import { AnimatedSprite, ColorMatrixFilter, Sprite, Ticker } from "pixi.js";
import { HedgehogAccessory } from "./Accessories";
import { FlameActor } from "../items/Flame";
import gsap from "gsap";
import { COLLISIONS } from "../misc/collisions";

export const HEDGEHOG_COLOR_OPTIONS = [
  "green",
  "red",
  "blue",
  "purple",
  "dark",
  "light",
  "greyscale",
  "sepia",
  "invert",
  "rainbow",
] as const;

export type HedgehogActorColorOptions = (typeof HEDGEHOG_COLOR_OPTIONS)[number];

const COLOR_TO_FILTER_MAP: Record<
  HedgehogActorColorOptions,
  (filter: ColorMatrixFilter) => void
> = {
  red: (filter) => {
    filter.hue(350, true);
    filter.saturate(1.2, true);
    filter.brightness(0.9, true);
  },
  green: (filter) => {
    filter.hue(60, true);
    filter.saturate(1, true);
  },
  blue: (filter) => {
    filter.hue(210, true);
    filter.saturate(3, true);
    filter.brightness(0.9, true);
  },
  purple: (filter) => {
    filter.hue(240, true);
  },
  dark: (filter) => {
    filter.brightness(0.7, true);
  },
  light: (filter) => {
    filter.brightness(1.3, true);
  },
  sepia: (filter) => {
    filter.saturate(3.0, true);
    filter.brightness(0.7, true);
  },
  invert: (filter) => {
    filter.negative(true);
  },
  greyscale: (filter) => {
    filter.grayscale(0.3, true);
  },
  rainbow: (filter) => {},
};

export type HedgehogActorOptions = {
  player?: boolean;
  skin?: string;
  color?: HedgehogActorColorOptions | null;
  accessories?: HedgehogAccessory[];
  walking_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
};

const BASE_COLLISION_FILTER = {
  category: COLLISIONS.ACTOR,
  mask:
    COLLISIONS.ACTOR |
    COLLISIONS.PLATFORM |
    COLLISIONS.PROJECTILE |
    COLLISIONS.GROUND,
};

const DEFAULT_COLLISION_FILTER = {
  ...BASE_COLLISION_FILTER,
  category: COLLISIONS.ACTOR,
};

const NO_PLATFORM_COLLISION_FILTER = {
  ...BASE_COLLISION_FILTER,
  mask: COLLISIONS.ACTOR | COLLISIONS.PROJECTILE | COLLISIONS.GROUND,
};

export class HedgehogActor extends Actor {
  direction: "left" | "right" = "right";
  jumps = 0;
  walkSpeed = 0;
  ropeConstraint?: Constraint;
  accessorySprites: { [key: string]: Sprite } = {};
  overlayAnimation?: AnimatedSprite;
  isFlammable = true;
  hue = 0;
  health = 100;

  private filter = new ColorMatrixFilter();

  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  protected collisionFilter = DEFAULT_COLLISION_FILTER;

  constructor(
    game: Game,
    private options: HedgehogActorOptions
  ) {
    super(game);
    this.updateSprite("jump");
    this.setupKeyboardListeners();
    this.isInteractive = options.interactions_enabled ?? true;

    this.setPosition({
      x: window.innerWidth * Math.random(),
      y: Math.random() * 200,
    });
    this.setVelocity({
      x: (Math.random() - 0.5) * 5,
      y: -5,
    });

    this.syncAccessories();

    this.sprite.scale = {
      x: 0,
      y: 0,
    };

    gsap.to(this.sprite.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "elastic.out",
    });
  }

  updateSprite(sprite: string): void {
    const possibleAnimation = `skins/${this.options.skin ?? "default"}/${sprite}/tile`;

    // Set the sprite but selecting the skin as well
    const spriteName =
      this.game.spritesManager.toAvailableAnimation(possibleAnimation);

    if (!spriteName) {
      this.game.log(`Tried to load ${possibleAnimation} but it doesn't exist`);
      return;
    }
    super.updateSprite(spriteName);
    this.sprite.filters = [this.filter];
  }

  private fireTimer?: NodeJS.Timeout;

  public get isOnFire(): boolean {
    return !!this.fireTimer;
  }

  updateOptions(options: Partial<HedgehogActorOptions>): void {
    this.options = { ...this.options, ...options };
  }

  setOnFire(times: number = 3): void {
    clearTimeout(this.fireTimer);
    this.fireTimer = setTimeout(() => {
      if (times <= 1) {
        this.sprite.removeChild(this.overlayAnimation);
        this.overlayAnimation = undefined;
        this.fireTimer = undefined;
        return;
      }
      this.setOnFire(times - 1);
    }, 1000);

    this.connectedElements.forEach((element) => {
      this.maybeSetElementOnFire(element);
    });

    if (!this.overlayAnimation) {
      this.overlayAnimation = new AnimatedSprite(
        this.game.spritesManager.getAnimatedSpriteFrames("overlays/fire/tile")
      );
      this.overlayAnimation.play();
      this.overlayAnimation.anchor.set(0.5);
      this.overlayAnimation.alpha = 0.75;
      this.sprite.addChild(this.overlayAnimation);
    }

    this.setVelocity({
      x: (Math.random() - 0.5) * 20,
      y: this.getGround() ? -10 : this.rigidBody.velocity.y,
    });
  }

  jump(): void {
    const MAX_JUMPS = 2;
    if (this.jumps + 1 > MAX_JUMPS) {
      return;
    }

    this.setVelocity({
      x: 0,
      y: -10,
    });

    this.jumps++;
  }

  receiveDamage(amount: number): void {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
    }
  }

  setupKeyboardListeners(): () => void {
    const lastKeys: string[] = [];

    const keyDownListener = (e: KeyboardEvent): void => {
      if (!this.options.controls_enabled) {
        return;
      }

      const key = e.key.toLowerCase();

      lastKeys.push(key);
      if (lastKeys.length > 20) {
        lastKeys.shift();
      }

      if (["arrowdown", "s"].includes(key)) {
        // Temporarily disable platform collisions
        this.collisionFilterOverride = NO_PLATFORM_COLLISION_FILTER;

        // TODO: Do this more intelligently with timer management
        setTimeout(() => {
          this.collisionFilterOverride = undefined;
        }, 1000);
      }

      if ([" ", "w", "arrowup"].includes(key)) {
        this.jump();
      }

      if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
        this.walkSpeed = 0.05;

        // this.isControlledByUser = true;
        // if (this.mainAnimation?.name !== "walk") {
        //   this.setAnimation("walk");
        // }

        const direction = ["arrowleft", "a"].includes(key) ? "left" : "right";

        const moonwalk = e.altKey;
        const running = e.shiftKey;

        if (running) {
          this.walkSpeed *= 2;
        }

        this.walkSpeed =
          direction === "left" ? -this.walkSpeed : this.walkSpeed;

        if (moonwalk) {
          direction === "left" ? "right" : "left";
          // IMPORTANT: Moonwalking is hard so he moves slightly slower of course
          this.walkSpeed *= 0.8;
        }

        this.setDirection(direction);
      }
    };

    const keyUpListener = (e: KeyboardEvent): void => {
      // Reset friction
      // if (shouldIgnoreInput(e) || !this.hedgehogConfig.controls_enabled) {
      //   return;
      // }
      const key = e.key.toLowerCase();

      if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
        this.walkSpeed = 0;
      }
    };

    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);

    return () => {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    };
  }

  setDirection(direction: "left" | "right"): void {
    if (direction === "left") {
      this.sprite.scale.x = -1;
    } else {
      this.sprite.scale.x = 1;
    }
  }

  update(ticker: Ticker): void {
    super.update(ticker);

    const xForce = 25 * this.walkSpeed * this.rigidBody.mass;

    if (xForce !== 0) {
      this.setVelocity({
        x: xForce,
        y: this.rigidBody.velocity.y,
      });
    }

    if (!this.getGround()) {
      this.updateSprite("fall");
    } else {
      if (this.rigidBody.velocity.x !== 0) {
        this.updateSprite("walk");
      } else {
        this.updateSprite("walk");
        this.sprite.stop();
      }
    }

    // We want to make it look like the hedgehog's accessories are disconnected. If we are falling then we position them slightly above
    if (this.rigidBody.velocity.y > 0.1) {
      const yOffsetDiff = Math.max(
        -10,
        Math.min(0, -this.rigidBody.velocity.y)
      );
      Object.values(this.accessorySprites).forEach((sprite) => {
        sprite.y = yOffsetDiff;
      });
    } else {
      Object.values(this.accessorySprites).forEach((sprite) => {
        sprite.y = 0;
      });
    }

    this.updateColor(ticker);
  }

  private updateColor(ticker: Ticker) {
    if (this.options.color === "rainbow") {
      this.hue += 360 * (ticker.deltaMS / 1000);
      this.hue = this.hue > 360 ? 0 : this.hue;
      this.filter.hue(this.hue, false);
    } else if (this.options.color) {
      const options = COLOR_TO_FILTER_MAP[this.options.color];
      this.filter.reset();
      options?.(this.filter);
    }
  }

  private maybeSetElementOnFire(element: GameElement, pair?: Pair): void {
    if (!this.isOnFire || !element.isFlammable) {
      return;
    }

    if (element instanceof HedgehogActor && !element.isOnFire) {
      // Set all other actors on fire
      element.setOnFire(1);
      // If it isn't the player then damage it
      if (!element.options.player) {
        element.receiveDamage(50);
      }
    }

    // Create little flames
    const contact = pair?.contacts?.[0].vertex ?? this.rigidBody.position;
    FlameActor.fireBurst(this.game, contact);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    this.maybeSetElementOnFire(element, pair);

    if (element.rigidBody.bounds.min.y > this.rigidBody.bounds.min.y) {
      this.game.log("Hit something below");
      this.jumps = 0;
    } else {
      this.game.log("Hit something above");
      // We check if it is a platform and if so we ignore it

      if (element instanceof SyncedBox) {
        pair.isActive = false;
      }
    }
  }

  private syncAccessories(): void {
    this.options.accessories?.forEach((accessory) => {
      const frame = this.game.spritesManager.getSpriteFrames(
        `accessories/${accessory}.png`
      );

      // Add debug logs to check the frame
      if (!frame) {
        this.game.log("Frame not found!", `accessories/${accessory}.png`);
        return;
      }

      const sprite = new Sprite(frame);
      this.accessorySprites[accessory] = sprite;
      sprite.eventMode = "static";
      sprite.anchor.set(0.5);
      this.sprite.addChild(sprite);
    });
  }

  destroy(): void {
    this.setVelocity({
      x: 0,
      y: -5,
    });

    this.collisionFilter = {
      category: COLLISIONS.NONE,
      mask: COLLISIONS.NONE,
    };

    gsap.to(this.sprite.scale, {
      x: 0,
      y: 0,
      duration: 3,
      ease: "elastic.out",
      onComplete: () => {
        this.game.removeElement(this);
      },
    });
  }

  beforeUnload(): void {
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.game.app.stage.removeChild(sprite);
    });
  }
}
