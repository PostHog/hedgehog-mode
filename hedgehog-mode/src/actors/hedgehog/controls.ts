import { NO_PLATFORM_COLLISION_FILTER } from "../Actor";
import { HedgehogActor } from "../Hedgehog";

export class HedgehogActorControls {
  constructor(private actor: HedgehogActor) {
    this.setupKeyboardListeners();
  }

  setupKeyboardListeners(): () => void {
    const heldKeys = new Set<string>();

    const keyMapping = {
      ArrowLeft: "left",
      a: "left",
      ArrowRight: "right",
      d: "right",
      ArrowUp: "up",
      w: "up",
      " ": "up",
      ArrowDown: "down",
      s: "down",
      Shift: "shift",
      Alt: "alt",
      f: "f",
      F: "f",
    };

    const horizontalHandler = (e: KeyboardEvent) => {
      const left = heldKeys.has("left");
      const right = heldKeys.has("right");

      if ((left && right) || (!left && !right)) {
        // Means we are not moving in a particular direction
        this.actor.walkSpeed = 0;
        return;
      }

      this.actor.walkSpeed = 2;

      let direction: "left" | "right" = left ? "left" : "right";

      const moonwalk = heldKeys.has("alt");
      const running = heldKeys.has("shift");

      if (running) {
        this.actor.walkSpeed *= 2;
      }

      this.actor.walkSpeed =
        direction === "left" ? -this.actor.walkSpeed : this.actor.walkSpeed;

      if (moonwalk) {
        direction = direction === "left" ? "right" : "left";
        // IMPORTANT: Moonwalking is hard so he moves slightly slower of course
        this.actor.walkSpeed *= 0.8;
      }

      this.actor.setDirection(direction);
      this.actor.ai.pause(5000);
    };

    let fireInterval: NodeJS.Timeout | undefined = undefined;
    let jumpCancelTimeout: NodeJS.Timeout | undefined = undefined;

    const keyHandlers: Record<
      string,
      {
        on: (e: KeyboardEvent) => void;
        off: (e: KeyboardEvent) => void;
      }
    > = {
      down: {
        on: () => {
          // Temporarily disable platform collisions
          this.actor.collisionFilterOverride = NO_PLATFORM_COLLISION_FILTER;
          // TODO: Do this some other way...
          this.actor.ai.pause(5000);

          if (this.actor.rigidBody!.velocity.y < 0.1) {
            this.actor.setVelocity({
              x: this.actor.rigidBody!.velocity.x,
              y: 0,
            });
          }
        },
        off: () => {
          this.actor.collisionFilterOverride = undefined;
        },
      },
      up: {
        on: () => {
          clearTimeout(jumpCancelTimeout ?? undefined);
          this.actor.jump();
          this.actor.ai.pause(5000);
        },
        off: () => {
          clearTimeout(jumpCancelTimeout);
          jumpCancelTimeout = setTimeout(() => {
            this.actor.cancelJump();
          }, 100);
        },
      },
      left: {
        on: (e) => horizontalHandler(e),
        off: (e) => horizontalHandler(e),
      },
      right: {
        on: (e) => horizontalHandler(e),
        off: (e) => horizontalHandler(e),
      },
      shift: {
        on: (e) => horizontalHandler(e),
        off: (e) => horizontalHandler(e),
      },
      alt: {
        on: (e) => horizontalHandler(e),
        off: (e) => horizontalHandler(e),
      },
      f: {
        on: () => {
          if (fireInterval) {
            clearInterval(fireInterval);
          }
          fireInterval = setInterval(() => {
            this.actor.maybeSpawnFireball();
          }, 100);
          this.actor.maybeSpawnFireball();
        },
        off: () => {
          if (fireInterval) {
            clearInterval(fireInterval);
            fireInterval = null;
          }
        },
      },
    };

    const keyDownListener = (e: KeyboardEvent): void => {
      if (!this.actor.options.controls_enabled) {
        return;
      }
      const key = keyMapping[e.key as keyof typeof keyMapping] ?? e.key;

      if (!heldKeys.has(key)) {
        heldKeys.add(key);
        keyHandlers[key]?.on(e);
      }
    };

    const keyUpListener = (e: KeyboardEvent): void => {
      const key = keyMapping[e.key as keyof typeof keyMapping] ?? e.key;

      if (heldKeys.has(key)) {
        heldKeys.delete(key);
        keyHandlers[key]?.off(e);
      }
    };

    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);

    return () => {
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
    };
  }
}
