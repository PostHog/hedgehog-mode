import { NO_PLATFORM_COLLISION_FILTER } from "../Actor";
import { HedgehogActor } from "../Hedgehog";
import { ControlKey, resolveControlKey } from "../../misc/keyboard";

export class HedgehogActorControls {
  private teardown: () => void;

  constructor(private actor: HedgehogActor) {
    this.teardown = this.setupKeyboardListeners();
  }

  setupKeyboardListeners(): () => void {
    const heldKeys = new Set<ControlKey>();

    const horizontalHandler = () => {
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

    // While web-slinging, up/down climb the web instead of jumping/ducking.
    const verticalHandler = () => {
      if (!this.actor.isWebSlinging) {
        return;
      }
      const up = heldKeys.has("up");
      const down = heldKeys.has("down");
      this.actor.webClimbDirection = up && !down ? 1 : down && !up ? -1 : 0;
    };

    let fireInterval: NodeJS.Timeout | undefined = undefined;
    let jumpCancelTimeout: NodeJS.Timeout | undefined = undefined;

    const keyHandlers: Record<
      ControlKey,
      {
        on: () => void;
        off: () => void;
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
          verticalHandler();
        },
        off: () => {
          this.actor.collisionFilterOverride = undefined;
          verticalHandler();
        },
      },
      up: {
        on: () => {
          clearTimeout(jumpCancelTimeout ?? undefined);
          this.actor.jump();
          this.actor.ai.pause(5000);
          verticalHandler();
        },
        off: () => {
          clearTimeout(jumpCancelTimeout);
          jumpCancelTimeout = setTimeout(() => {
            this.actor.cancelJump();
          }, 100);
          verticalHandler();
        },
      },
      left: {
        on: horizontalHandler,
        off: horizontalHandler,
      },
      right: {
        on: horizontalHandler,
        off: horizontalHandler,
      },
      shift: {
        on: horizontalHandler,
        off: horizontalHandler,
      },
      alt: {
        on: horizontalHandler,
        off: horizontalHandler,
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
            fireInterval = undefined;
          }
        },
      },
    };

    const releaseKey = (key: ControlKey): void => {
      if (heldKeys.delete(key)) {
        keyHandlers[key].off();
      }
    };

    // Browsers don't deliver keyup for keys that were still down when the
    // window lost focus, so without this, alt-tabbing mid-stride leaves the hog
    // walking with no way to stop him.
    const releaseAllKeys = (): void => {
      heldKeys.forEach((key) => releaseKey(key));
    };

    const keyDownListener = (e: KeyboardEvent): void => {
      if (!this.actor.options.controls_enabled) {
        return;
      }

      // ⌘/ctrl combos belong to the browser and to the debug renderer
      // (ctrl+d), not to us. macOS also swallows the keyup while ⌘ is held, so
      // claiming ⌘+d would leave him running right until the next blur.
      if (e.metaKey || e.ctrlKey) {
        return;
      }

      const key = resolveControlKey(e);

      if (key && !heldKeys.has(key)) {
        heldKeys.add(key);
        keyHandlers[key].on();
      }
    };

    const keyUpListener = (e: KeyboardEvent): void => {
      const key = resolveControlKey(e);

      if (key) {
        releaseKey(key);
      }
    };

    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyUpListener);
    window.addEventListener("blur", releaseAllKeys);

    return () => {
      releaseAllKeys();
      clearInterval(fireInterval);
      clearTimeout(jumpCancelTimeout);
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyUpListener);
      window.removeEventListener("blur", releaseAllKeys);
    };
  }

  /** Detach the global listeners. Called when the actor is unloaded. */
  destroy(): void {
    this.teardown();
  }
}
