import {
  Actor,
  DEFAULT_COLLISION_FILTER,
  NO_PLATFORM_COLLISION_FILTER,
} from "./Actor";
import { HedgehogModeInterface, GameElement, UpdateTicker } from "../types";
import Matter, { Pair } from "matter-js";
import { SyncedPlatform } from "../items/SyncedPlatform";
import { AnimatedSprite, ColorMatrixFilter, Sprite } from "pixi.js";
import { FlameActor } from "../items/Flame";
import gsap from "gsap";
import { COLLISIONS } from "../misc/collisions";
import { HedgehogActorAI } from "./hedgehog/ai";
import { HedgehogActorControls } from "./hedgehog/controls";
import { HedgehogActorOptions } from "./hedgehog/config";
import { HedgehogActorInterface } from "./hedgehog/interface";
import { applyStaticColor } from "./hedgehog/colors";
import type { HedgehogSkinAbility } from "./hedgehog/abilities";
import { getSkinDefinition, HedgehogSkinDefinition } from "./hedgehog/skins";
import type { SpiderWebActor } from "../items/SpiderWebActor";

// Horizontal speed a swing must exceed before the hog commits to facing that
// way. Below it he holds his current facing (hysteresis), so the jittery near-
// zero velocities at the bottom and apexes of a swing don't make him flicker.
const SWING_FACING_VELOCITY = 2;

export class HedgehogActor extends Actor {
  jumps = 0;
  walkSpeed = 0;
  // The web currently attached to (and pulling) this hog, if any. Only one at a
  // time — released webs detach and drift off on their own.
  private attachedWeb?: SpiderWebActor;
  private ability?: HedgehogSkinAbility;
  // The skin `ability` was built for, so we only rebuild on real skin changes.
  private abilitySkin?: HedgehogActorOptions["skin"];
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

    // Wires up the skin ability via syncSkinAbility().
    this.updateOptions(options);
  }

  // Per-skin tuning (physics, jump, render, ...). Reads `options.skin` each
  // time so runtime skin changes are picked up automatically.
  private get skinDefinition(): HedgehogSkinDefinition {
    return getSkinDefinition(this.options.skin);
  }

  // While a web strand is attached the hog swings purely under physics — its
  // own AI/keyboard movement (walkSpeed, jump) is suppressed so it can't push
  // itself off the web.
  get isWebSlinging(): boolean {
    return !!this.attachedWeb;
  }

  /** Called by a {@link SpiderWebActor} when it latches onto this hog. */
  attachWeb(web: SpiderWebActor): void {
    this.attachedWeb = web;
    // Pass through platforms while swinging.
    this.collisionFilterOverride = NO_PLATFORM_COLLISION_FILTER;
  }

  /** Called when a web releases the hog (or is torn down). */
  detachWeb(web: SpiderWebActor): void {
    if (this.attachedWeb !== web) {
      return;
    }
    this.attachedWeb = undefined;
    this.collisionFilterOverride = undefined;
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
      animationSpeed: this.skinDefinition.animationSpeed,
      loop: options.loop ?? true,
      ...options,
    });
    this.sprite!.filters = [this.filter];
    this.sprite!.alpha = this.skinDefinition.spriteAlpha;
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

  protected setupSpriteEvents(): void {
    super.setupSpriteEvents();

    this.sprite!.on("pointerover", () => {
      this.ai.run("wave");
    });
  }

  public startDrag(downEvent: PointerEvent): void {
    // Touch users never get pointerover, so wave when they grab us instead
    if (downEvent.pointerType !== "mouse") {
      this.ai.run("wave");
    }
    super.startDrag(downEvent);
  }

  updateOptions(options: Partial<HedgehogActorOptions>): void {
    this.options = { ...this.options, ...options };
    this.ai.enable(this.options.ai_enabled ?? true);
    this.syncAccessories();
    this.syncRigidBody();
    this.syncSkinAbility();
  }

  // Skin can change at runtime (e.g. "become spiderhog"), so keep the skin
  // ability in sync. Only rebuilds when the skin actually changes, so unrelated
  // option updates (colour, accessories, ...) don't tear down an active sling.
  private syncSkinAbility(): void {
    if (this.options.skin === this.abilitySkin) {
      return;
    }
    this.ability?.destroy();
    this.ability = this.skinDefinition.createAbility?.(this, this.game);
    this.abilitySkin = this.options.skin;
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
    if (this.isWebSlinging) {
      return;
    }
    if (this.jumps + 1 > this.skinDefinition.maxJumps) {
      return;
    }

    this.setVelocity({
      x: 0,
      y: this.skinDefinition.jumpVelocity,
    });

    this.jumps++;
  }

  cancelJump(): void {
    if (this.isWebSlinging || this.rigidBody!.velocity.y > 0) {
      return;
    }
    this.setVelocity({
      x: this.rigidBody!.velocity.x,
      y: 0,
    });
  }

  receiveDamage(amount: number): void {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
    }
  }

  setDirection(direction: "left" | "right"): void {
    if (direction === "left" && this.sprite!.scale.x > 0) {
      this.sprite!.scale.x *= -1;
    } else if (direction !== "left" && this.sprite!.scale.x < 0)
      this.sprite!.scale.x *= -1;
  }

  getDirection(): "left" | "right" {
    return this.sprite!.scale.x < 0 ? "left" : "right";
  }

  update(ticker: UpdateTicker): void {
    let mask = this.skinDefinition.collisionMask;

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

    if (!this.isWebSlinging && xForce !== 0) {
      this.setVelocity({
        x: xForce,
        y: this.rigidBody!.velocity.y,
      });
    }

    // While swinging he's physics-driven, so face the way he's moving — but
    // only once his horizontal speed clearly commits to a direction. Below the
    // threshold he holds his facing, so the near-zero velocities at the bottom
    // and apexes of a swing don't make him flicker.
    if (this.isWebSlinging) {
      const vx = this.rigidBody!.velocity.x;
      if (vx < -SWING_FACING_VELOCITY) {
        this.setDirection("left");
      } else if (vx > SWING_FACING_VELOCITY) {
        this.setDirection("right");
      }
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
      applyStaticColor(this.filter, this.options.color);
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

  // Triggered by the `f` key; delegates to the skin's ability (hogzilla only).
  maybeSpawnFireball(): void {
    this.ability?.fire?.();
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
    const body = this.skinDefinition.body;
    this.rigidBody!.density = body.density!;
    this.rigidBody!.friction = body.friction!;
    this.rigidBody!.frictionStatic = body.frictionStatic!;
    this.rigidBody!.frictionAir = body.frictionAir!;
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

      const anchor = this.skinDefinition.accessoryAnchor;
      if (anchor) {
        sprite.anchor.set(anchor.x, anchor.y);
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
    this.ability?.destroy();
    this.ai.enable(false);
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.game.app.stage.removeChild(sprite);
    });
  }
}
