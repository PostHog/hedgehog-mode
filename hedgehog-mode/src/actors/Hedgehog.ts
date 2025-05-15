import {
  Actor,
  DEFAULT_COLLISION_FILTER,
  NO_PLATFORM_COLLISION_FILTER,
} from "./Actor";
import { Game, GameElement, UpdateTicker } from "../types";
import Matter, { Constraint, Pair, Vector } from "matter-js";
import { SyncedPlatform } from "../items/SyncedPlatform";
import { AnimatedSprite, ColorMatrixFilter, Sprite } from "pixi.js";
import { FlameActor } from "../items/Flame";
import gsap from "gsap";
import { HedgehogActorAI } from "./hedgehog/ai";
import { HedgehogActorControls } from "./hedgehog/controls";
import {
  HedgehogActorAccessoryOption,
  HedgehogActorColorOption,
  HedgehogActorOptions,
} from "./hedgehog/config";
import { HedgehogActorInterface } from "./hedgehog/interface";
import { Projectile } from "../items/Projectile";
import * as Tone from "tone";
import { AvailableSpriteFrames } from "../sprites/sprites";
import { Inventory } from "../items/Inventory";
import { COLLISIONS } from "../misc/collisions";

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
  attachedInventorySprite?: Sprite;

  // Track mouse position for player
  mouseX: number = 0;
  mouseY: number = 0;
  private mouseMoveHandler?: (e: MouseEvent) => void;

  hitBoxModifier = {
    left: 0.24,
    right: 0.24,
    top: 0.35,
    bottom: 0.075,
  };

  protected collisionFilter = DEFAULT_COLLISION_FILTER;

  constructor(
    game: Game,
    public options: HedgehogActorOptions,
    public inventories: Inventory[] = []
  ) {
    super(game);
    this.updateSprite("jump");
    this.isInteractive = options.interactions_enabled ?? true;
    this.ai = new HedgehogActorAI(game, this);
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
    this.setupPointerListener();

    // Setup mouse tracking for player
    if (this.options.player) {
      this.mouseMoveHandler = (e: MouseEvent) => {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      };
      window.addEventListener("mousemove", this.mouseMoveHandler);
    }
  }

  updateSprite(
    sprite: string,
    options: { reset?: boolean; onComplete?: () => void; force?: boolean } = {}
  ): void {
    const holdingInventory = this.inventories.length > 0;
    const spritePath = holdingInventory ? `${sprite}-armless` : sprite;
    const possibleAnimation = `skins/${this.options.skin ?? "default"}/${spritePath}/tile`;

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
    this.game.audioContext &&
      this.game.audioContext.triggerAttackRelease("C4", "32n", Tone.now());
  }

  pickupAccessory(accessory: string): void {
    this.options.accessories = [
      ...(this.options.accessories ?? []),
      accessory as HedgehogActorAccessoryOption,
    ];
    this.syncAccessories();
  }

  fireWeapon(target: Vector): void {
    if (this.inventories.length === 0) {
      return;
    }

    const projectile = new Projectile(this.game, this, {
      target,
    });
    this.game.world.addElement(projectile);
  }

  receiveDamage(amount: number, source: Actor): void {
    // Move away from the source
    const xDirection =
      source.rigidBody!.position.x > this.rigidBody!.position.x ? 1 : -1;

    this.setVelocity({
      x: xDirection * 10,
      y: -1,
    });

    this.health -= amount;

    this.updateSprite("shock", {
      reset: true,
      onComplete: () => {
        this.updateSprite("wave");
      },
    });

    if (this.health <= 0) {
      this.destroy();
    }
  }

  setupPointerListener(): void {
    window.addEventListener("pointerdown", (e) => {
      if (!this.options.player) {
        return;
      }
      let pointerX = e.clientX;
      let pointerY = e.clientY;

      this.fireWeapon({
        x: pointerX,
        y: pointerY,
      });

      const interval = setInterval(() => {
        this.fireWeapon({
          x: pointerX,
          y: pointerY,
        });
      }, 250);

      const onPointerMove = (e: PointerEvent) => {
        pointerX = e.clientX;
        pointerY = e.clientY;
      };

      const onPointerCancel = () => {
        clearInterval(interval);
      };

      // if (this.options.skin !== "spiderhog") {
      //   return;
      // }

      // this.collisionFilterOverride = NO_PLATFORM_COLLISION_FILTER;

      // const rope = Composites.stack(
      //   400,
      //   100,
      //   1,
      //   8,
      //   0,
      //   5,
      //   (x: number, y: number) => {
      //     return Bodies.rectangle(x, y, 5, 20, {
      //       density: 0.0005,
      //       frictionAir: 0.02,
      //     });
      //   }
      // );
      // Composites.chain(rope, 0.5, 0, -0.5, 0, {
      //   stiffness: 0.9,
      //   render: { visible: true },
      // });

      // const firstLink = rope.bodies[0];
      // const lastLink = rope.bodies[rope.bodies.length - 1];

      // const webAnchor = Constraint.create({
      //   pointA: { x: e.clientX, y: e.clientY },
      //   bodyB: firstLink,
      //   length: 0,
      //   stiffness: 1,
      //   render: { visible: true },
      // });

      // const webAttachment = Constraint.create({
      //   bodyA: lastLink,
      //   bodyB: this.rigidBody!,
      //   length: 10,
      //   stiffness: 1,
      //   render: { visible: true },
      // });

      // Matter.World.add(this.game.engine.world, [
      //   rope,
      //   webAnchor,
      //   webAttachment,
      // ]);

      // const onDragMove = (e: PointerEvent) => {
      //   webAnchor.pointA.x = e.clientX;
      //   webAnchor.pointA.y = e.clientY;
      // };

      // const onDragEnd = (e: PointerEvent) => {
      //   this.isDragging = false;
      //   Matter.World.remove(this.game.engine.world, [
      //     rope,
      //     webAnchor,
      //     webAttachment,
      //   ]);

      //   window.removeEventListener("pointermove", onDragMove);
      //   this.collisionFilterOverride = undefined;
      // };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerCancel);
      window.addEventListener("pointercancel", onPointerCancel);
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

    if (!["shock", "wave"].includes(this.currentSprite)) {
      // Set the appropriate animation unless certain ones are playing
      if (!this.getGround()) {
        this.updateSprite("fall");
      } else if (Math.abs(this.rigidBody!.velocity.x) > 0.1) {
        // If horizontal movement is noticeable then walk
        this.updateSprite("walk");
      } else if (["fall", "walk"].includes(this.currentSprite)) {
        this.updateSprite("idle");
        this.sprite!.stop();
      }
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

    // if player, point to mouse,
    // if not player, point to player
    // If the player is holding an inventory then we want to position it in front of the hedgehog
    if (this.attachedInventorySprite) {
      if (this.options.player) {
        // Update sprite to holding versions
        this.updateSprite("game-hold");

        const hedgehogGlobal = this.sprite!.getGlobalPosition();
        const parentScaleX = this.sprite!.scale.x;
        const angle = Math.atan2(
          this.mouseY - hedgehogGlobal.y,
          this.mouseX - hedgehogGlobal.x
        );

        const facingLeft = parentScaleX < 0;

        // Flip gun vertically if the angle is on the "opposite" side
        const shouldFlipY =
          (facingLeft && angle > -Math.PI / 2 && angle < Math.PI / 2) ||
          (!facingLeft && (angle < -Math.PI / 2 || angle > Math.PI / 2));

        this.attachedInventorySprite.scale.y = shouldFlipY ? -1 : 1;

        if (facingLeft) {
          // Flip angle across vertical axis
          this.attachedInventorySprite.rotation = Math.PI - angle;
        } else {
          this.attachedInventorySprite.rotation = angle;
        }
      } else {
        const player = this.game.world.elements.find(
          (e) => e instanceof HedgehogActor && e.options.player
        );
        if (player) {
          const playerGlobal = player.sprite!.getGlobalPosition();
          const enemyGlobal = this.sprite!.getGlobalPosition();
          const angleToPlayer = Math.atan2(
            playerGlobal.y - enemyGlobal.y,
            playerGlobal.x - enemyGlobal.x
          );
          const parentScaleX = this.sprite!.scale.x;
          const facingLeft = parentScaleX < 0;
          const shouldFlipY =
            (facingLeft &&
              angleToPlayer > -Math.PI / 2 &&
              angleToPlayer < Math.PI / 2) ||
            (!facingLeft &&
              (angleToPlayer < -Math.PI / 2 || angleToPlayer > Math.PI / 2));
          this.attachedInventorySprite.scale.y = shouldFlipY ? -1 : 1;
          if (facingLeft) {
            this.attachedInventorySprite.rotation = Math.PI - angleToPlayer;
          } else {
            this.attachedInventorySprite.rotation = angleToPlayer;
          }
        }
      }
    }
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
        element.receiveDamage(50, this);
      }
    }

    // Create little flames
    const contact = pair?.contacts?.[0].vertex ?? this.rigidBody!.position;
    FlameActor.fireBurst(this.game, contact);
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);
    this.maybeSetElementOnFire(element, pair);

    // Check if it is a weapon and if so then pick it up
    if (element instanceof Inventory) {
      // Remove the weapon from the world
      this.game.world.removeElement(element);

      // TODO: Add to the player's inventory
      this.pickupInventory(element);
    }

    const isGroundContact = pair.collision.normal.y < -0.5; // normal points up into the hog
    if (isGroundContact) this.jumps = 0;

    if (element.rigidBody!.bounds.min.y > this.rigidBody!.bounds.min.y) {
      this.game.log("Hit something below");
      this.jumps = 0;
      this.game.audioContext &&
        this.game.audioContext.triggerAttackRelease("C2", "32n", Tone.now());
    } else {
      this.game.log("Hit something above");
      // We check if it is a platform and if so we ignore it

      if (element instanceof SyncedPlatform) {
        pair.isActive = false;
      }
    }
  }

  private pickupInventory(inventory: Inventory): void {
    this.inventories.push(inventory);
    this.syncInventory();
    this.attachInventorySprite(inventory);
  }

  private attachInventorySprite = (inventory: Inventory): void => {
    if (!inventory.sprite) return;
    // Clone the inventory sprite for attachment
    const attachedSprite = new Sprite(inventory.sprite.texture);
    attachedSprite.anchor.set(0.5, 0.7);
    attachedSprite.x = 7; // Position in front of hedgehog (tweak as needed)
    attachedSprite.y = 6;
    attachedSprite.zIndex = 10;
    attachedSprite.eventMode = "static";
    this.sprite!.addChild(attachedSprite);
    attachedSprite.scale.set(inventory.scale);
    // TODO first remove any existing inventory sprites
    this.attachedInventorySprite &&
      this.sprite!.removeChild(this.attachedInventorySprite);
    // TODO make this single
    this.attachedInventorySprite = attachedSprite;
  };

  private syncInventory(): void {
    this.inventories.forEach((inventory) => {
      this.game.world.removeElement(inventory);
    });
  }

  private syncAccessories(): void {
    // TODO: Remove old accessories
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.sprite!.removeChild(sprite);
    });

    this.accessorySprites = {};

    this.options.accessories?.forEach((accessory) => {
      const frame = this.game.spritesManager.getSpriteFrames(
        `accessories/${accessory}.png` as AvailableSpriteFrames
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
    // this.setVelocity({
    //   x: 0,
    //   y: -5,
    // });

    const accessories = this.options.accessories;
    this.options.accessories = [];
    this.syncAccessories();

    accessories?.forEach((accessory) => {
      this.game.world.spawnAccessory(accessory, this.rigidBody!.position);
    });

    // Remove attached inventory sprites from hedgehog sprite
    this.attachedInventorySprite &&
      this.sprite!.removeChild(this.attachedInventorySprite);
    this.attachedInventorySprite = undefined;

    this.inventories.forEach((inventory) => {
      const newItem = this.game.world.spawnInventory(inventory.type);
      newItem.setPosition(this.rigidBody!.position);
    });
    this.inventories = [];

    if (!this.options.player) {
      // Start the death animation
      this.collisionFilterOverride = {
        category: COLLISIONS.ACTOR,
        mask: COLLISIONS.GROUND | COLLISIONS.PLATFORM,
      };

      this.ai.enable(false);
      this.walkSpeed = 0;

      this.updateSprite("death", {
        force: true,
        onComplete: () => {
          setTimeout(() => {
            this.game.world.spawnHedgehogGhost(this.rigidBody!.position);
          }, 500);

          // Trigger the fade out
          gsap.to(this.sprite!, {
            alpha: 0,
            duration: 5,
            ease: "power2.inOut",
            onComplete: () => {
              this.game.world.removeElement(this);
            },
          });
        },
      });
    }
  }

  beforeUnload(): void {
    this.ai.enable(false);
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.game.app.stage.removeChild(sprite);
    });
    // Remove attached inventory sprites from hedgehog sprite
    this.attachedInventorySprite &&
      this.sprite!.removeChild(this.attachedInventorySprite);
    this.attachedInventorySprite = undefined;

    // Remove mousemove event listener if set
    if (this.mouseMoveHandler) {
      window.removeEventListener("mousemove", this.mouseMoveHandler);
      this.mouseMoveHandler = undefined;
    }
  }
}
