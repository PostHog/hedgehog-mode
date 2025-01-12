import { Actor } from "./Actor";
import { Game, GameElement } from "../types";
import Matter, { Constraint } from "matter-js";
import { SyncedBox } from "../items/SyncedBox";

export type HedgehogActorOptions = {
  skin?: string;
  color?: string | null;
  accessories?: string[];
  walking_enabled?: boolean;
  interactions_enabled?: boolean;
  controls_enabled?: boolean;
};

export class HedgehogActor extends Actor {
  direction: "left" | "right" = "right";
  jumps = 0;
  walkSpeed = 0;

  ropeConstraint?: Constraint;

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

    this.setupRopeConstraint();
  }

  private setupRopeConstraint(): void {
    if (!this.options.controls_enabled) {
      return;
    }

    window.addEventListener("mousedown", (e) => {
      console.log("mousedown");
      this.ropeConstraint = Constraint.create({
        pointA: { x: e.clientX, y: e.clientY },
        bodyB: this.rigidBody,
        stiffness: 0.01,
      });
      Matter.World.addConstraint(this.game.engine.world, this.ropeConstraint);
    });

    window.addEventListener("mousemove", (e) => {
      console.log("mousemove");
      if (!this.ropeConstraint) {
        return;
      }
      this.ropeConstraint.pointA.x = e.clientX;
      this.ropeConstraint.pointA.y = e.clientY;
    });

    window.addEventListener("mouseup", (e) => {
      console.log("mouseup");
      Matter.World.remove(this.game.engine.world, this.ropeConstraint);
      this.ropeConstraint = undefined;
    });
  }

  private setOnFire(): void {
    // this.loadSprite("skins/default/fire/tile");
  }

  private jump(): void {
    const MAX_JUMPS = 2;
    if (this.jumps + 1 > MAX_JUMPS) {
      return;
    }

    const force = this.rigidBody.mass * -0.025;
    Matter.Body.applyForce(this.rigidBody, this.rigidBody.position, {
      x: 0,
      y: force,
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

      if ([" ", "w", "arrowup"].includes(key)) {
        this.jump();
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

      if (["arrowleft", "a", "arrowright", "d"].includes(key)) {
        this.walkSpeed = 0.05;

        // this.isControlledByUser = true;
        // if (this.mainAnimation?.name !== "walk") {
        //   this.setAnimation("walk");
        // }

        this.direction = ["arrowleft", "a"].includes(key) ? "left" : "right";

        const moonwalk = e.ctrlKey;
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
        console.log("Resetting walk speed");
      }
    };

    // const onMouseDown = (e: MouseEvent): void => {
    //   // if (
    //   //   !this.hedgehogConfig.controls_enabled ||
    //   //   this.hedgehogConfig.skin !== "spiderhog"
    //   // ) {
    //   //   return;
    //   // }

    //   // Whilst the mouse is down we will move the hedgehog towards it
    //   // First check that we haven't clicked the hedgehog
    //   const elementBounds = this.element?.getBoundingClientRect();
    //   if (
    //     elementBounds &&
    //     e.clientX >= elementBounds.left &&
    //     e.clientX <= elementBounds.right &&
    //     e.clientY >= elementBounds.top &&
    //     e.clientY <= elementBounds.bottom
    //   ) {
    //     return;
    //   }

    //   this.setAnimation("fall");
    //   this.followMouse = true;
    //   this.lastKnownMousePosition = [e.clientX, e.clientY];

    //   const onMouseMove = (e: MouseEvent): void => {
    //     this.lastKnownMousePosition = [e.clientX, e.clientY];
    //   };

    //   const onMouseUp = (): void => {
    //     this.followMouse = false;
    //     window.removeEventListener("mousemove", onMouseMove);
    //   };

    //   window.addEventListener("mousemove", onMouseMove);
    //   window.addEventListener("mouseup", onMouseUp);
    // };

    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    // window.addEventListener("mousedown", onMouseDown);

    return () => {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    };
  }

  update(): void {
    super.update();

    const xForce = 25 * this.walkSpeed * this.rigidBody.mass;

    if (xForce !== 0) {
      console.log("Applying force", xForce);
      // TODO: Only apply if on ground - also account for ground friction
      // Matter.Body.applyForce(this.rigidBody, this.rigidBody.position, {
      //   x: xForce,
      //   y: 0,
      // });

      Matter.Body.setVelocity(this.rigidBody, {
        x: xForce,
        y: this.rigidBody.velocity.y,
      });
    }

    if (
      this.rigidBody.velocity.y > 0.5 &&
      this.currentAnimation !== "skins/default/fall/tile"
    ) {
      this.updateSprite("skins/default/fall/tile");
    }

    if (this.direction === "left") {
      this.sprite.scale.x = -1;
    } else {
      this.sprite.scale.x = 1;
    }
  }

  onCollision(element: GameElement, pair: Matter.Pair): void {
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
}
