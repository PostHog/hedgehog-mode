import {
  Actor,
  DEFAULT_COLLISION_FILTER,
  NO_PLATFORM_COLLISION_FILTER,
} from "./Actor";
import { Game, GameElement, UpdateTicker } from "../types";
import Matter, { Bodies, Composites, Constraint, Pair } from "matter-js";
import { SyncedPlatform } from "../items/SyncedPlatform";
import { AnimatedSprite, ColorMatrixFilter, Sprite } from "pixi.js";
import { FlameActor } from "../items/Flame";
import gsap from "gsap";
import { COLLISIONS } from "../misc/collisions";
import { HedgehogActorAI } from "./hedgehog/ai";
import { HedgehogActorControls } from "./hedgehog/controls";
import {
  HedgehogActorColorOption,
  HedgehogActorOptions,
} from "./hedgehog/config";
import { HedgehogActorInterface } from "./hedgehog/interface";

export const COLOR_TO_FILTER_MAP: Record<
  HedgehogActorColorOption,
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

export class HedgehogActor extends Actor {
  jumps = 0;
  walkSpeed = 0;
  ropeConstraint?: Constraint;
  accessorySprites: { [key: string]: Sprite } = {};
  overlayAnimation?: AnimatedSprite;
  isFlammable = true;
  hue = 0;
  health = 100;
  ai: HedgehogActorAI;
  controls: HedgehogActorControls;
  private filter = new ColorMatrixFilter();
  interface: HedgehogActorInterface;

  hitBoxModifier = {
    left: 0.24,
    right: 0.24,
    top: 0.35,
    bottom: 0.075,
  };

  protected collisionFilter = DEFAULT_COLLISION_FILTER;

  constructor(
    game: Game,
    public options: HedgehogActorOptions
  ) {
    super(game);
    this.updateSprite("jump");
    this.isInteractive = options.interactions_enabled ?? true;
    this.ai = new HedgehogActorAI(this);
    this.controls = new HedgehogActorControls(this);
    this.interface = new HedgehogActorInterface(game, this);
    this.setPosition({
      x: window.innerWidth * Math.random(),
      y: Math.random() * 200,
    });
    this.setVelocity({
      x: (Math.random() - 0.5) * 5,
      y: -5,
    });

    this.sprite!.scale = {
      x: 0,
      y: 0,
    };

    gsap.to(this.sprite!.scale, {
      x: 1,
      y: 1,
      duration: 0.5,
      ease: "elastic.out",
    });

    this.updateOptions(options);
    this.setupSpiderHogRope();
  }

  updateSprite(
    sprite: string,
    options: { reset?: boolean; onComplete?: () => void } = {}
  ): void {
    const possibleAnimation = `skins/${this.options.skin ?? "default"}/${sprite}/tile`;

    // Set the sprite but selecting the skin as well
    const spriteName =
      this.game.spritesManager.toAvailableAnimation(possibleAnimation);

    if (!spriteName) {
      this.game.log(`Tried to load ${possibleAnimation} but it doesn't exist`);
      return;
    }
    super.updateSprite(spriteName, options);
    this.sprite!.filters = [this.filter];
  }

  get currentSprite(): string {
    return this.currentAnimation!.split("/")[2];
  }

  private fireTimer?: NodeJS.Timeout;

  public get isOnFire(): boolean {
    return !!this.fireTimer;
  }

  protected onClick(): void {
    if (this.options.onClick) {
      this.options.onClick();
    } else {
      this.interface.onClick();
    }
  }

  setupPointerEvents(): void {
    super.setupPointerEvents();

    this.sprite!.on("pointerover", () => {
      this.ai.run("wave");
    });

    this.sprite!.on("pointerout", () => {});
  }

  updateOptions(options: Partial<HedgehogActorOptions>): void {
    this.options = { ...this.options, ...options };
    this.ai.enable(this.options.ai_enabled ?? true);
    this.syncAccessories();
  }

  setOnFire(times: number = 3): void {
    clearTimeout(this.fireTimer);
    this.fireTimer = setTimeout(() => {
      if (times <= 1) {
        this.sprite!.removeChild(this.overlayAnimation!);
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
      this.sprite!.addChild(this.overlayAnimation);
    }

    this.setVelocity({
      x: (Math.random() - 0.5) * 20,
      y: this.getGround() ? -10 : this.rigidBody!.velocity.y,
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

  setupSpiderHogRope(): void {
    window.addEventListener("pointerdown", (e) => {
      if (this.options.skin !== "spiderhog") {
        return;
      }

      this.collisionFilterOverride = NO_PLATFORM_COLLISION_FILTER;

      const rope = Composites.stack(
        400,
        100,
        1,
        8,
        0,
        5,
        (x: number, y: number) => {
          return Bodies.rectangle(x, y, 5, 20, {
            density: 0.0005,
            frictionAir: 0.02,
          });
        }
      );
      Composites.chain(rope, 0.5, 0, -0.5, 0, {
        stiffness: 0.9,
        render: { visible: true },
      });

      const firstLink = rope.bodies[0];
      const lastLink = rope.bodies[rope.bodies.length - 1];

      const webAnchor = Constraint.create({
        pointA: { x: e.clientX, y: e.clientY },
        bodyB: firstLink,
        length: 0,
        stiffness: 1,
        render: { visible: true },
      });

      const webAttachment = Constraint.create({
        bodyA: lastLink,
        bodyB: this.rigidBody!,
        length: 10,
        stiffness: 1,
        render: { visible: true },
      });

      Matter.World.add(this.game.engine.world, [
        rope,
        webAnchor,
        webAttachment,
      ]);

      const onDragMove = (e: PointerEvent) => {
        webAnchor.pointA.x = e.clientX;
        webAnchor.pointA.y = e.clientY;
      };

      const onDragEnd = (e: PointerEvent) => {
        this.isDragging = false;
        Matter.World.remove(this.game.engine.world, [
          rope,
          webAnchor,
          webAttachment,
        ]);

        window.removeEventListener("pointermove", onDragMove);
        this.collisionFilterOverride = undefined;
      };

      window.addEventListener("pointermove", onDragMove);
      window.addEventListener("pointerup", onDragEnd);
      window.addEventListener("pointercancel", onDragEnd);
    });
  }

  setDirection(direction: "left" | "right"): void {
    if (direction === "left" && this.sprite!.scale.x > 0) {
      this.sprite!.scale.x *= -1;
    } else if (direction !== "left" && this.sprite!.scale.x < 0)
      this.sprite!.scale.x *= -1;
  }

  update(ticker: UpdateTicker): void {
    if (this.rigidBody!.velocity.y < -0.1) {
      // We are moving upwards so we don't want to collide with platforms
      this.collisionFilter = NO_PLATFORM_COLLISION_FILTER;
    } else {
      this.collisionFilter = DEFAULT_COLLISION_FILTER;
    }

    super.update(ticker);

    const xForce = this.walkSpeed;

    if (xForce !== 0) {
      this.setVelocity({
        x: xForce,
        y: this.rigidBody!.velocity.y,
      });
    }

    // Set the appropriate animation
    if (!this.getGround()) {
      this.updateSprite("fall");
    } else if (Math.abs(this.rigidBody!.velocity.x) > 0.1) {
      // If horizontal movement is noticeable then walk
      this.updateSprite("walk");
    } else if (["fall", "walk"].includes(this.currentSprite)) {
      // NOTE:  wave is just used as a placeholder anim. WE should have a dedicated idle animation
      this.updateSprite("wave");
      this.sprite!.stop();
    }

    // We want to make it look like the hedgehog's accessories are disconnected. If we are falling then we position them slightly above
    if (this.rigidBody!.velocity.y > 0.1) {
      const yOffsetDiff = Math.max(
        -10,
        Math.min(0, -this.rigidBody!.velocity.y)
      );
      Object.values(this.accessorySprites).forEach((sprite) => {
        sprite.y = yOffsetDiff;
      });
    } else {
      Object.values(this.accessorySprites).forEach((sprite) => {
        sprite.y = 0;
      });
    }

    // Check if below screen and if so then move up
    if (this.rigidBody!.position.y > this.game.app.screen.height) {
      this.setPosition({
        x: this.rigidBody!.position.x,
        y: 0,
      });
    }

    this.updateColor(ticker);
  }

  private updateColor(ticker: UpdateTicker) {
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
    const contact = pair?.contacts?.[0].vertex ?? this.rigidBody!.position;
    FlameActor.fireBurst(this.game, contact);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    this.maybeSetElementOnFire(element, pair);

    if (element.rigidBody!.bounds.min.y > this.rigidBody!.bounds.min.y) {
      this.game.log("Hit something below");
      this.jumps = 0;
    } else {
      this.game.log("Hit something above");
      // We check if it is a platform and if so we ignore it

      if (element instanceof SyncedPlatform) {
        pair.isActive = false;
      }
    }
  }

  private syncAccessories(): void {
    // TODO: Remove old accessories
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.sprite!.removeChild(sprite);
    });

    this.accessorySprites = {};

    this.options.accessories?.forEach((accessory) => {
      const frame = this.game.spritesManager.getSpriteFrames(
        `accessories/${accessory}.png`
      );

      if (!frame) {
        this.game.log("Frame not found!", `accessories/${accessory}.png`);
        return;
      }

      const sprite = new Sprite(frame);
      this.accessorySprites[accessory] = sprite;
      sprite.eventMode = "static";
      sprite.anchor.set(0.5);
      this.sprite!.addChild(sprite);
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

    gsap.to(this.sprite!.scale, {
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
    this.ai.enable(false);
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.game.app.stage.removeChild(sprite);
    });
  }
}
