import { Actor } from "./Actor";
import { Game, GameElement } from "../types";
import Matter, { Constraint } from "matter-js";
import { SyncedBox } from "../items/SyncedBox";
import { AnimatedSprite, Sprite } from "pixi.js";
import { HedgehogAccessory } from "./Accessories";

export type HedgehogActorOptions = {
  skin?: string;
  color?: string | null;
  accessories?: HedgehogAccessory[];
  walking_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
};

export class HedgehogActor extends Actor {
  direction: "left" | "right" = "right";
  jumps = 0;
  walkSpeed = 0;
  ropeConstraint?: Constraint;
  accessorySprites: { [key: string]: Sprite } = {};
  overlayAnimation?: AnimatedSprite;

  hitBoxModifier = {
    left: 0.25,
    right: 0.24,
    top: 0.2,
    bottom: 0.05,
  };

  constructor(
    game: Game,
    private options: HedgehogActorOptions
  ) {
    super(game, {});
    this.loadSprite("skins/default/jump/tile");
    this.setupKeyboardListeners();
    this.isInteractive = options.interactions_enabled ?? true;

    Matter.Body.setPosition(this.rigidBody, {
      x: window.innerWidth * Math.random(),
      y: 0,
    });

    this.syncAccessories();
    // this.setupRopeConstraint();
  }

  private fireTimer?: NodeJS.Timeout;

  public get isOnFire(): boolean {
    return !!this.fireTimer;
  }

  private setOnFire(times: number = 3): void {
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

    Matter.Body.setVelocity(this.rigidBody, {
      x: (Math.random() - 0.5) * 20,
      y: this.getGround() ? -10 : this.rigidBody.velocity.y,
    });
  }

  private jump(): void {
    const MAX_JUMPS = 2;
    if (this.jumps + 1 > MAX_JUMPS) {
      return;
    }

    Matter.Body.setVelocity(this.rigidBody, {
      x: 0,
      y: -10,
    });

    this.jumps++;
  }

  setupKeyboardListeners(): () => void {
    const lastKeys: string[] = [];

    const secretMap: {
      keys: string[];
      action: () => void;
    }[] = [
      {
        keys: ["f", "f", "f"],
        action: () => this.setOnFire(),
      },
      {
        keys: ["f", "i", "r", "e"],
        action: () => this.setOnFire(),
      },
      {
        keys: ["s", "p", "i", "d", "e", "r", "h", "o", "g"],
        action: () => {
          this.options.skin = "spiderhog";
        },
      },
      {
        keys: [
          "arrowup",
          "arrowup",
          "arrowdown",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "arrowleft",
          "arrowright",
          "b",
          "a",
        ],
        action: () => {
          this.setOnFire();
          // this.gravity = -2;

          // lemonToast.info("I must leave. My people need me!");
          // setTimeout(() => {
          //   this.gravity = GRAVITY_PIXELS;
          // }, 2000);
        },
      },
    ];

    const keyDownListener = (e: KeyboardEvent): void => {
      if (!this.options.controls_enabled) {
        return;
      }

      const key = e.key.toLowerCase();

      lastKeys.push(key);
      if (lastKeys.length > 20) {
        lastKeys.shift();
      }

      secretMap.forEach((secret) => {
        if (
          lastKeys.slice(-secret.keys.length).join("") === secret.keys.join("")
        ) {
          secret.action();
          lastKeys.splice(-secret.keys.length);
        }
      });

      // if (["arrowdown", "s"].includes(key)) {
      //   if (this.ground === document.body) {
      //     if (this.mainAnimation?.name !== "wave") {
      //       this.setAnimation("wave");
      //     }
      //   } else if (this.ground) {
      //     const box = elementToBox(this.ground);
      //     this.ignoreGroundAboveY = box.y + box.height - SPRITE_SIZE;
      //     this.ground = null;
      //     this.setAnimation("fall");
      //   }
      // }

      if ([" ", "w", "arrowup"].includes(key)) {
        this.jump();
      }

      if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
        this.walkSpeed = 0.05;

        // this.isControlledByUser = true;
        // if (this.mainAnimation?.name !== "walk") {
        //   this.setAnimation("walk");
        // }

        this.direction = ["arrowleft", "a"].includes(key) ? "left" : "right";

        const moonwalk = e.altKey;
        const running = e.shiftKey;

        if (running) {
          this.walkSpeed *= 2;
        }

        this.walkSpeed =
          this.direction === "left" ? -this.walkSpeed : this.walkSpeed;

        if (moonwalk) {
          this.direction = this.direction === "left" ? "right" : "left";
          // IMPORTANT: Moonwalking is hard so he moves slightly slower of course
          this.walkSpeed *= 0.8;
        }
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

  update(): void {
    super.update();

    // Match the position of the accessory to the hedgehog
    // Object.values(this.accessorySprites).forEach((sprite) => {
    //   sprite.x = this.sprite.x;
    //   sprite.y = this.sprite.y;
    // });

    const xForce = 25 * this.walkSpeed * this.rigidBody.mass;

    if (xForce !== 0) {
      Matter.Body.setVelocity(this.rigidBody, {
        x: xForce,
        y: this.rigidBody.velocity.y,
      });
    }

    if (this.direction === "left") {
      this.sprite.scale.x = -1;
    } else {
      this.sprite.scale.x = 1;
    }

    if (!this.getGround()) {
      this.updateSprite("skins/default/fall/tile");
    } else {
      if (this.rigidBody.velocity.x !== 0) {
        this.updateSprite("skins/default/walk/tile");
      } else {
        this.updateSprite("skins/default/wave/tile");
        this.sprite.stop();
      }
    }

    // We want to make it look like the hedgehog's accesories are disconnected. If we are falling then we position them slightly above
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
  }

  private maybeSetElementOnFire(element: GameElement): void {
    if (
      element instanceof HedgehogActor &&
      this.isOnFire &&
      !element.isOnFire
    ) {
      // TODO: This could be made better by checking for adjacent boxes when we start the fire too
      element.setOnFire(1);
    }
  }

  onCollisionStart(element: GameElement, pair: Matter.Pair): void {
    super.onCollisionStart(element, pair);

    this.maybeSetElementOnFire(element);

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

  beforeUnload(): void {
    Object.values(this.accessorySprites).forEach((sprite) => {
      this.game.app.stage.removeChild(sprite);
    });
  }
}
