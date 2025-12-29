import {
  Actor,
  DEFAULT_COLLISION_FILTER,
  NO_PLATFORM_COLLISION_FILTER,
} from "./Actor";
import { HedgehogModeInterface, GameElement, UpdateTicker } from "../types";
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
  isDead = false;
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
    game: HedgehogModeInterface,
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

  private isGhost(): boolean {
    return this.options.skin === "ghost";
  }

  updateSprite(
    sprite: string,
    options: {
      reset?: boolean;
      animationSpeed?: number;
      onComplete?: () => void;
      forceSkin?: string;
      loop?: boolean;
    } = {}
  ): void {
    const skin = options.forceSkin ?? this.options.skin ?? "default";
    const idleAnimation = `skins/${skin}/idle/tile`;
    const possibleAnimation = `skins/${skin}/${sprite}/tile`;

    // Set the sprite but selecting the skin as well
    let spriteName =
      this.game.spritesManager.toAvailableAnimation(possibleAnimation);

    if (!spriteName) {
      if (!this.sprite) {
        spriteName =
          this.game.spritesManager.toAvailableAnimation(idleAnimation);

        if (!spriteName) {
          this.game.log(`Tried to load ${idleAnimation} but it doesn't exist`);
          // Something went wrong!
          return;
        }
      } else {
        // We just ignore it
        return;
      }
    }
    super.updateSprite(spriteName, {
      animationSpeed: this.isGhost() ? 0.1 : 0.5,
      loop: options.loop ?? true,
      ...options,
    });
    this.sprite!.filters = [this.filter];
    this.sprite!.alpha = this.isGhost() ? 0.5 : 1;
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
    this.syncRigidBody();
  }

  clearOverlayAnimation(): void {
    if (this.overlayAnimation) {
      this.sprite!.removeChild(this.overlayAnimation!);
    }
    this.overlayAnimation = undefined;
  }

  setOnFire(times: number = 3): void {
    if (this.isDead) {
      return;
    }

    clearTimeout(this.fireTimer);
    this.fireTimer = setTimeout(() => {
      if (times <= 1) {
        this.clearOverlayAnimation();
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
    const MAX_JUMPS = this.isGhost() ? Infinity : 2;
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
    let mask = this.isGhost()
      ? COLLISIONS.GROUND
      : COLLISIONS.ACTOR | COLLISIONS.PROJECTILE | COLLISIONS.GROUND;

    if (this.rigidBody!.velocity.y < -0.1) {
      // We are moving upwards so we don't want to collide with platforms
    } else {
      mask = mask | COLLISIONS.PLATFORM;
    }

    this.collisionFilter.mask = mask;

    super.update(ticker);

    if (this.isDead) {
      return;
    }

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
      this.updateSprite("idle", {
        loop: false,
        onComplete: () => {
          this.updateSprite("idle", {
            loop: true,
          });
        },
      });
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
    } else {
      const options = this.options.color
        ? COLOR_TO_FILTER_MAP[this.options.color]
        : undefined;
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

      if (element instanceof HedgehogActor) {
        const velocity = this.rigidBody!.velocity.y;

        // Min of 5 to start damage
        const velocityMultiplier = Math.max(0, velocity - 5);
        const weightMultiplier = this.sprite!.scale.y;
        const damage = weightMultiplier * weightMultiplier * velocityMultiplier;

        element.receiveDamage(damage);
      }
    } else {
      this.game.log("Hit something above");
      // We check if it is a platform and if so we ignore it

      if (element instanceof SyncedPlatform) {
        pair.isActive = false;
      }
    }
  }

  private syncRigidBody(): void {
    if (this.isGhost()) {
      this.rigidBody!.density = 0.0001;
      this.rigidBody!.friction = 0.1;
      this.rigidBody!.frictionStatic = 0;
      this.rigidBody!.frictionAir = 0.2;
    } else {
      this.rigidBody!.density = 0.001;
      this.rigidBody!.friction = 0.2;
      this.rigidBody!.frictionStatic = 0;
      this.rigidBody!.frictionAir = 0.01;
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

      if (this.options.skin === "ghost") {
        sprite.anchor.set(0.4, 0.55);
      }

      if (this.options.skin === "hogzilla") {
        sprite.anchor.set(0.45, 0.5);
      }
    });
  }

  destroy(): void {
    if (this.isDead) {
      return;
    }
    this.isDead = true;

    this.updateOptions({
      ai_enabled: false,
      controls_enabled: false,
    });
    this.clearOverlayAnimation();

    const accessories = this.options.accessories;
    this.options.accessories = [];
    this.syncAccessories();

    accessories?.forEach((accessory) => {
      this.game.spawnAccessory(accessory, this.rigidBody!.position);
    });

    this.setVelocity({
      x: 0,
      y: 0,
    });

    this.updateSprite("death", {
      reset: true,
      animationSpeed: 0.1,
      forceSkin: "default",
      onComplete: () => {
        this.game.spawnHedgehogGhost(this.rigidBody!.position);
        gsap.to(this.sprite!, {
          alpha: 0,
          duration: 2,
          ease: "power2.inOut",
          onComplete: () => {
            this.game.removeElement(this);
          },
        });
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
